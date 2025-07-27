"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

import { useGetBloodUnitById, useSeparateComponents } from "../../services/inventory";
import { StaffProfileService } from "../../services/staffProfile";

// ====== TÍNH NGÀY HẾT HẠN ======
const today = new Date();
today.setHours(0, 0, 0, 0);

const addDays = (days: number) => {
	const d = new Date();
	d.setDate(d.getDate() + days);
	return d.toISOString().split("T")[0];
};

const addMonths = (months: number) => {
	const d = new Date();
	d.setMonth(d.getMonth() + months);
	return d.toISOString().split("T")[0];
};

// ====== VALIDATE ZOD ======
const formSchema = z.object({
	redCellsVolume: z.number().min(1, "Dung tích hồng cầu phải lớn hơn 0"),
	redCellsExpiredDate: z.string().refine((dateStr) => {
		const date = new Date(dateStr);
		date.setHours(0, 0, 0, 0);
		const maxDate = new Date(today);
		maxDate.setDate(today.getDate() + 42); // 42 ngày cho RBC
		return date >= today && date <= maxDate;
	}, "Ngày hết hạn hồng cầu phải trong vòng 42 ngày kể từ hôm nay"),

	plasmaVolume: z.number().min(1, "Dung tích huyết tương phải lớn hơn 0"),
	plasmaExpiredDate: z.string().refine((dateStr) => {
		const date = new Date(dateStr);
		date.setHours(0, 0, 0, 0);
		const maxDate = new Date(today);
		maxDate.setFullYear(today.getFullYear() + 1); // 12 tháng cho Plasma
		return date >= today && date <= maxDate;
	}, "Ngày hết hạn huyết tương phải trong vòng 12 tháng kể từ hôm nay"),

	plateletsVolume: z.number().min(1, "Dung tích tiểu cầu phải lớn hơn 0"),
	plateletsExpiredDate: z.string().refine((dateStr) => {
		const date = new Date(dateStr);
		date.setHours(0, 0, 0, 0);
		const maxDate = new Date(today);
		maxDate.setDate(today.getDate() + 7); // 7 ngày cho tiểu cầu
		return date >= today && date <= maxDate;
	}, "Ngày hết hạn tiểu cầu phải trong vòng 7 ngày kể từ hôm nay"),
});

interface UpdateBloodUnitDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	bloodUnitId: string;
}

function useGetStaffProfile() {
	return useQuery({
		queryKey: ["staffProfile"],
		queryFn: () => StaffProfileService.getProfile(),
	});
}

export default function UpdateBloodUnitDialog({
	open,
	onOpenChange,
	bloodUnitId,
}: UpdateBloodUnitDialogProps) {
	const { data: bloodUnitData } = useGetBloodUnitById(bloodUnitId);
	const { data: staffProfile } = useGetStaffProfile();
	const separateMutation = useSeparateComponents();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			redCellsVolume: 0,
			redCellsExpiredDate: addDays(42), // Auto gợi ý
			plasmaVolume: 0,
			plasmaExpiredDate: addMonths(12), // Auto gợi ý
			plateletsVolume: 0,
			plateletsExpiredDate: addDays(7), // Auto gợi ý
		},
		mode: "onChange", // cần thiết để isValid cập nhật ngay
	});

	const initialBloodVolume = bloodUnitData?.data?.bloodVolume || 0;
	const totalUsedVolume = form
		.watch(["redCellsVolume", "plasmaVolume", "plateletsVolume"])
		.reduce((sum, value) => sum + (value || 0), 0);
	const remainingVolume = initialBloodVolume - totalUsedVolume;

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			if (!staffProfile?.id) {
				throw new Error("Không thể lấy thông tin nhân viên");
			}

			await separateMutation.mutateAsync({
				wholeBloodUnitId: bloodUnitId,
				redCellsVolume: values.redCellsVolume,
				redCellsExpiredDate: values.redCellsExpiredDate,
				plasmaVolume: values.plasmaVolume,
				plasmaExpiredDate: values.plasmaExpiredDate,
				plateletsVolume: values.plateletsVolume,
				plateletsExpiredDate: values.plateletsExpiredDate,
			});
			toast.success("Tách máu thành công");
			onOpenChange(false);
		} catch (error) {
			toast.error("Tách máu thất bại");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:min-w-3xl">
				<DialogHeader>
					<DialogTitle>Tách đơn vị máu</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
						<div className="col-span-2">
							<FormItem>
								<FormLabel>Tổng dung tích máu (ml)</FormLabel>
								<FormControl>
									<Input type="number" value={initialBloodVolume} readOnly disabled />
								</FormControl>
								<p className="text-sm text-gray-500">
									Dung tích còn lại: {remainingVolume >= 0 ? remainingVolume : 0} ml
								</p>
							</FormItem>
						</div>

						<FormField
							control={form.control}
							name="redCellsVolume"
							render={({ field }) => (
								<FormItem className="col-span-1">
									<FormLabel>Dung tích hồng cầu (ml)</FormLabel>
									<FormControl>
										<Input
											type="number"
											{...field}
											onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="redCellsExpiredDate"
							render={({ field }) => (
								<FormItem className="col-span-1">
									<FormLabel>Ngày hết hạn hồng cầu</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="plasmaVolume"
							render={({ field }) => (
								<FormItem className="col-span-1">
									<FormLabel>Dung tích huyết tương (ml)</FormLabel>
									<FormControl>
										<Input
											type="number"
											{...field}
											onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="plasmaExpiredDate"
							render={({ field }) => (
								<FormItem className="col-span-1">
									<FormLabel>Ngày hết hạn huyết tương</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="plateletsVolume"
							render={({ field }) => (
								<FormItem className="col-span-1">
									<FormLabel>Dung tích tiểu cầu (ml)</FormLabel>
									<FormControl>
										<Input
											type="number"
											{...field}
											onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="plateletsExpiredDate"
							render={({ field }) => (
								<FormItem className="col-span-1">
									<FormLabel>Ngày hết hạn tiểu cầu</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							className="col-span-2"
							disabled={remainingVolume < 0 || !form.formState.isValid}
						>
							Tách máu
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
