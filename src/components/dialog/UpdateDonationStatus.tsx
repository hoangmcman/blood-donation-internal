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
import { useSearchParams } from "react-router-dom";

interface UpdateDonationRequestDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	donationId: string;
}

const formSchema = z.object({
	status: z.string().min(1, "Vui lòng chọn trạng thái mới"),
	appointmentDate: z.string().optional(),
	note: z.string().optional(),
});

type Status = z.infer<typeof formSchema>["status"];

const VALID_TRANSITIONS: Record<Status, Status[]> = {
	pending: ["rejected", "appointment_confirmed", "customer_cancelled"],
	appointment_confirmed: ["appointment_cancelled", "customer_checked_in"],
	appointment_cancelled: [],
	customer_cancelled: [],
	completed: ["result_returned"],
	rejected: [],
	result_returned: [],
	appointment_absent: [],
	customer_checked_in: ["completed"],
};

const getStatusLabel = (status: Status): string => {
	const statusLabels: Record<Status, string> = {
		pending: "Request chờ duyệt",
		rejected: "Request bị từ chối",
		completed: "Lấy máu thành công, chưa trả kết quả",
		result_returned: "Đã trả kết quả chính thức",
		appointment_confirmed: "Xác nhận request",
		appointment_cancelled: "Hủy lịch hẹn",
		appointment_absent: "Vắng mặt vào ngày lấy máu",
		customer_cancelled: "Khách hàng hủy",
		customer_checked_in: "Khách hàng đã check-in",
	};
	return statusLabels[status] || status;
};

export default function UpdateDonationRequestDialog({
	open,
	onOpenChange,
	donationId,
}: UpdateDonationRequestDialogProps) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			status: "",
			appointmentDate: "",
			note: "",
		},
	});

	const { data: donationData } = useGetDonationRequestById(donationId);
	const { mutate } = useUpdateDonationStatus();
	const [, setSearchParams] = useSearchParams();
	useEffect(() => {
		if (donationData) {
			form.reset({
				status: "", // Reset to empty to show placeholder
				appointmentDate: donationData.appointmentDate
					? new Date(donationData.appointmentDate).toISOString()
					: "",
				note: "",
			});
		}
	}, [donationData, form]);

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		const selectedStatus = values.status as Status;
		mutate(
			{ id: donationId, statusData: { ...values, status: selectedStatus } },
			{
				onSuccess: () => {
					toast.success("Cập nhật trạng thái thành công");
					onOpenChange(false);

					// ✅ Cập nhật luôn filter ngoài bằng URL param
					setSearchParams((prev) => {
						prev.set("status", selectedStatus);
						return prev;
					});
				},
			}
		);
	};

	// Get available status options based on current status
	const getAvailableStatuses = (): Status[] => {
		const currentStatus = (donationData?.currentStatus as Status) || "pending";
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
						{getAvailableStatuses().length > 0 ? (
							<>
								<FormField
									control={form.control}
									name="status"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Trạng thái mới</FormLabel>
											<Select onValueChange={field.onChange} value={field.value}>
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
										<FormItem>
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
								<Button type="submit">Cập nhật trạng thái</Button>
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
