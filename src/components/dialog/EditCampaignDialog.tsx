"use client";

import { Loader2Icon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCampaign } from "@/services/campaign";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
	name: z.string().min(1, "Tên chiến dịch là bắt buộc"),
	description: z.string().optional(),
	startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
	endDate: z.string().optional(),
	banner: z.string().url("Định dạng URL không hợp lệ"),
	location: z.string().min(1, "Địa điểm là bắt buộc"),
	limitDonation: z.number().min(1, "Giới hạn quyên góp phải ít nhất là 1"),
	bloodCollectionDate: z.string().min(1, "Ngày thu thập máu là bắt buộc"),
});

interface EditCampaignDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	campaign: {
		id: string;
		name: string;
		description?: string;
		startDate: string;
		endDate?: string;
		banner?: string;
		location?: string;
		limitDonation?: number;
		bloodCollectionDate?: string;
	};
}

function ButtonLoading() {
	return (
		<Button size="sm" disabled className="col-span-2">
			<Loader2Icon className="animate-spin mr-2 h-4 w-4" />
			Vui lòng chờ
		</Button>
	);
}

export function EditCampaignDialog({ open, onOpenChange, campaign }: EditCampaignDialogProps) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: campaign.name,
			description: campaign.description || "",
			startDate: campaign.startDate.split("T")[0],
			endDate: campaign.endDate?.split("T")[0] || "",
			banner: campaign?.banner || "",
			location: campaign?.location || "",
			limitDonation: campaign?.limitDonation || 0,
			bloodCollectionDate: campaign.bloodCollectionDate?.split("T")[0] || "",
		},
	});

	const updateMutation = useUpdateCampaign();

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			await updateMutation.mutateAsync({ id: campaign.id, payload: values });
			toast.success("Cập nhật chiến dịch thành công");
			onOpenChange(false);
		} catch (error) {
			toast.error("Cập nhật chiến dịch thất bại");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Chỉnh sửa chiến dịch</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tên chiến dịch</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem className="col-span-2">
									<FormLabel>Mô tả</FormLabel>
									<FormControl>
										<Textarea {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="startDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Ngày bắt đầu</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="endDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Ngày kết thúc</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="bloodCollectionDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Ngày thu thập máu</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="banner"
							render={({ field }) => (
								<FormItem>
									<FormLabel>URL Banner</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="location"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Địa điểm</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="limitDonation"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Giới hạn quyên góp</FormLabel>
									<FormControl>
										<Input
											type="number"
											{...field}
											onChange={(e) => field.onChange(parseInt(e.target.value))}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						{updateMutation.isPending ? (
							<ButtonLoading />
						) : (
							<Button type="submit" className="col-span-2">
								Cập nhật chiến dịch
							</Button>
						)}
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
