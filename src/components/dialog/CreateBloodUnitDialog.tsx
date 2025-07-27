"use client";

import React from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";

import { useGetDonationRequestById, useGetDonationResultById } from "../../services/donations";
import { useCreateBloodUnit } from "../../services/inventory";
import { Input } from "../ui/input";

const formSchema = z.object({
	bloodGroup: z.string().min(1, { message: "Nhóm máu là bắt buộc" }),
	bloodRh: z.string().min(1, { message: "Rh máu là bắt buộc" }),
	bloodVolume: z.number().min(1, { message: "Dung tích máu phải lớn hơn 0" }),
	remainingVolume: z.number().min(0, { message: "Dung tích còn lại phải ít nhất là 0" }),
	expiredDate: z.string().min(1, { message: "Ngày hết hạn là bắt buộc" }),
	donationRequestId: z.string().min(1, { message: "ID yêu cầu hiến máu là bắt buộc" }),
});

interface CreateBloodUnitDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	donationRequestId: string;
	memberName: string;
}

export default function CreateBloodUnitDialog({
	open,
	onOpenChange,
	donationRequestId,
}: CreateBloodUnitDialogProps) {
	const { data: donationRequest, isLoading: isRequestLoading } =
		useGetDonationRequestById(donationRequestId);
	const { data: donationResult, isLoading: isResultLoading } = useGetDonationResultById(donationRequestId);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			bloodGroup: "",
			bloodRh: "",
			bloodVolume: 0, // Đảm bảo giá trị mặc định là number
			remainingVolume: 0, // Đảm bảo giá trị mặc định là number
			expiredDate: "",
			donationRequestId: donationRequestId
		},
	});

	React.useEffect(() => {
		if (donationRequest && !isRequestLoading) {
			form.reset({
				bloodGroup: donationRequest.donor.bloodType?.group || "",
				bloodRh: donationRequest.donor.bloodType?.rh || "",
				bloodVolume: donationResult?.volumeMl ?? 0, // Sử dụng ?? để đảm bảo giá trị number
				remainingVolume: donationResult?.volumeMl ?? 0, // Sử dụng ?? để đảm bảo giá trị number
				expiredDate: "",
			});
		}
	}, [donationRequest, isRequestLoading, donationResult, form]);

	const { mutate } = useCreateBloodUnit();

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		mutate(
			{
				memberId: donationRequest!.donor!.id,
				bloodGroup: values.bloodGroup,
				bloodRh: values.bloodRh,
				bloodVolume: values.bloodVolume,
				remainingVolume: values.remainingVolume,
				expiredDate: values.expiredDate,
				donationRequestId: values.donationRequestId,
			},
			{
				onSuccess: () => {
					toast.success("Tạo đơn vị máu thành công");
					onOpenChange(false);
					form.reset();
				},
				onError: (err: any) => {
					console.error(err);
					toast.error("Tạo đơn vị máu thất bại");
				},
			}
		);
	};

	// Đồng bộ remainingVolume với bloodVolume khi bloodVolume thay đổi
	React.useEffect(() => {
		const subscription = form.watch((values, { name }) => {
			if (name === "bloodVolume") {
				form.setValue("remainingVolume", values.bloodVolume ?? 0); // Xử lý undefined bằng 0
			}
		});
		return () => subscription.unsubscribe();
	}, [form]);

	const isLoading = isRequestLoading || isResultLoading;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Tạo đơn vị máu mới</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="bloodGroup"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nhóm máu</FormLabel>
									<FormControl>
										<Input {...field} className="w-full p-2 border rounded" disabled />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="bloodRh"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Rh máu</FormLabel>
									<FormControl>
										<Input {...field} className="w-full p-2 border rounded" disabled />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="bloodVolume"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Dung tích máu (ml)</FormLabel>
									<FormControl>
										<Input
											type="number"
											{...field}
											onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} // Xử lý khi giá trị không hợp lệ
											className="w-full p-2 border rounded"
											disabled={!!donationResult?.volumeMl} // Vô hiệu hóa nếu có volumeMl từ API
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="remainingVolume"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Dung tích còn lại (ml)</FormLabel>
									<FormControl>
										<Input
											type="number"
											{...field}
											onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} // Xử lý khi giá trị không hợp lệ
											className="w-full p-2 border rounded"
											disabled={true} // Vô hiệu hóa vì đồng bộ với bloodVolume
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="expiredDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Ngày hết hạn</FormLabel>
									<FormControl>
										<Input type="date" {...field} className="w-full p-2 border rounded" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="donationRequestId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>ID yêu cầu hiến máu</FormLabel>
									<FormControl>
										<Input {...field} className="w-full p-2 border rounded" disabled />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" disabled={isLoading}>
							Tạo đơn vị máu
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
