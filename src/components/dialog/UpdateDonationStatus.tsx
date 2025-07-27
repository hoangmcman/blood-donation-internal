import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetDonationRequestById, useUpdateDonationStatus } from "@/services/donations";
import { zodResolver } from "@hookform/resolvers/zod";

interface UpdateDonationRequestDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	donationId: string;
	selectedStatus?: string; // Optional prop for selected status
}

const formSchema = z.object({
	status: z.string().optional(),
	appointmentDate: z.string().optional(),
	note: z.string().optional(),
	volumeMl: z.number().min(0, "Dung tích phải lớn hơn hoặc bằng 0").optional(),
});

type Status = string;

const VALID_TRANSITIONS: Record<Status, Status[]> = {
	appointment_confirmed: ["customer_checked_in", "appointment_cancelled", "appointment_absent"],
	appointment_cancelled: [],
	customer_cancelled: [],
	completed: ["result_returned"],
	rejected: [],
	result_returned: [],
	appointment_absent: [],
	customer_checked_in: ["no_show_after_checkin", "not_qualified", "completed"],
	no_show_after_checkin: [],
	not_qualified: [],
};

const getStatusLabel = (status: Status): string => {
	const statusLabels: Record<Status, string> = {
		appointment_confirmed: "Xác nhận lịch hẹn",
		appointment_cancelled: "Hủy lịch hẹn",
		appointment_absent: "Vắng mặt vào ngày lấy máu",
		customer_cancelled: "Khách hàng hủy",
		completed: "Lấy máu thành công, chưa trả kết quả",
		result_returned: "Đã trả kết quả chính thức",
		customer_checked_in: "Khách hàng đã check-in",
		no_show_after_checkin: "Không xuất hiện sau check-in",
		not_qualified: "Không đủ điều kiện",
	};
	return statusLabels[status] || status;
};

export default function UpdateDonationRequestDialog({
	open,
	onOpenChange,
	donationId,
	selectedStatus,
}: UpdateDonationRequestDialogProps) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			status: "",
			appointmentDate: "",
			note: "",
			volumeMl: undefined,
		},
	});

	const { data: donationData } = useGetDonationRequestById(donationId);
	const { mutate, isPending } = useUpdateDonationStatus();

	useEffect(() => {
		if (donationData) {
			form.reset({
				appointmentDate: donationData.appointmentDate
					? new Date(donationData.appointmentDate).toISOString()
					: "",
				note: "",
				volumeMl: donationData.volumeMl || undefined,
			});
		}
	}, [donationData, form, selectedStatus]);

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		// Kiểm tra ngày hẹn có hợp lệ hay không
		const appointmentDate = values.appointmentDate ? new Date(values.appointmentDate) : null;
		const today = new Date();
		today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00 để so sánh ngày

		if (appointmentDate && appointmentDate < today) {
			// Hiển thị toast lỗi nếu ngày hẹn trong quá khứ
			toast.error("Ngày hẹn không hợp lệ. Vui lòng chọn ngày trong tương lai.");
			return;
		}

		mutate(
			{ id: donationId, statusData: { ...values, status: values.status || "completed" } },
			{
				onSuccess: () => {
					toast.success("Cập nhật trạng thái thành công");
					onOpenChange(false);
				},
				onError: () => {
					toast.error("Có lỗi xảy ra khi cập nhật trạng thái.");
				},
			}
		);
	};

	// Get available status options based on current status
	const getAvailableStatuses = (): Status[] => {
		const currentStatus = (donationData?.currentStatus as Status) || "appointment_confirmed";
		return VALID_TRANSITIONS[currentStatus] || [];
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Cập nhật trạng thái yêu cầu hiến máu</DialogTitle>
					{donationData && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<span>Trạng thái hiện tại:</span>
							<Badge variant="outline">
								{getStatusLabel(donationData.currentStatus as Status)}
							</Badge>
						</div>
					)}
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						{selectedStatus === "customer_checked_in" ||
						donationData?.currentStatus === "customer_checked_in" ? (
							<>
								<FormField
									control={form.control}
									name="volumeMl"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Dung tích máu (ml)</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="Nhập dung tích máu"
													value={field.value || ""}
													onChange={(e) => field.onChange(Number(e.target.value))}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="note"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Ghi chú</FormLabel>
											<FormControl>
												<Textarea {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit">Cập nhật trạng thái</Button>
							</>
						) : getAvailableStatuses().length > 0 ? (
							<>
								<FormField
									control={form.control}
									name="status"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Trạng thái mới</FormLabel>
											<Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Chọn trạng thái mới" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{getAvailableStatuses().map((status) => (
														<SelectItem key={status} value={status}>
															{getStatusLabel(status)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="appointmentDate"
									render={({ field }) => (
										<FormItem className="hidden">
											<FormLabel>Ngày hẹn (có giờ)</FormLabel>
											<FormControl>
												<Input
													type="datetime-local"
													value={
														field.value ? new Date(field.value).toISOString().slice(0, 16) : ""
													}
													onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="note"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Ghi chú</FormLabel>
											<FormControl>
												<Textarea {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit" disabled={isPending}>
									{isPending ? "Đang cập nhật..." : "Cập nhật trạng thái"}
								</Button>
							</>
						) : (
							<div className="text-center py-4">
								<p className="text-sm text-muted-foreground">
									Không có trạng thái nào có thể chuyển đổi từ trạng thái hiện tại.
								</p>
								<Button
									type="button"
									variant="outline"
									onClick={() => onOpenChange(false)}
									className="mt-4"
								>
									Đóng
								</Button>
							</div>
						)}
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
