"use client";

import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Item, UpdateDonationResultPayload } from "@/interfaces/donation";
import { useUpdateDonationResult } from "@/services/donations";

import { useGetDonationResultTemplateById } from "../../services/donationresulttemplates";

interface UpdateDonationResultDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	templateId: string;
	donationResultId: string;
}

export default function UpdateDonationResultDialog({
	open,
	onOpenChange,
	templateId,
	donationResultId,
}: UpdateDonationResultDialogProps) {
	const { data, isLoading, error } = useGetDonationResultTemplateById(templateId);
	const updateDonationResult = useUpdateDonationResult();
	const [formData, setFormData] = React.useState<UpdateDonationResultPayload>({
		templateId,
		bloodTestResults: {},
		resultDate: new Date().toISOString().split("T")[0],
		notes: "",
	});

	React.useEffect(() => {
		if (data?.data) {
			const initialBloodTestResults = data.data.items.reduce(
				(acc, item) => ({
					...acc,
					[item.id]: item.defaultValue || "",
				}),
				{} as { [key: string]: string }
			);
			setFormData((prev) => ({
				...prev,
				bloodTestResults: initialBloodTestResults,
			}));
		}
	}, [data]);

	const handleInputChange = (itemId: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			bloodTestResults: {
				...prev.bloodTestResults,
				[itemId]: value,
			},
		}));
	};

	const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setFormData((prev) => ({
			...prev,
			notes: e.target.value,
		}));
	};

	const handleSubmit = async () => {
		try {
			await updateDonationResult.mutateAsync({
				id: donationResultId,
				updateData: formData,
			});
			toast.success("Cập nhật kết quả hiến máu thành công");
			onOpenChange(false);
		} catch (error) {
			toast.error("Lỗi khi cập nhật kết quả hiến máu");
		}
	};

	if (isLoading) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[800px]">
					<DialogHeader>
						<DialogTitle>Cập nhật Kết quả Hiến máu</DialogTitle>
					</DialogHeader>
					<div>Đang tải...</div>
				</DialogContent>
			</Dialog>
		);
	}

	if (error || !data?.success || !data?.data) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[800px]">
					<DialogHeader>
						<DialogTitle>Cập nhật Kết quả Hiến máu</DialogTitle>
					</DialogHeader>
					<div>Lỗi: {error?.message || "Không thể tải chi tiết mẫu"}</div>
				</DialogContent>
			</Dialog>
		);
	}

	const template = data.data;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Cập nhật Kết quả Hiến máu</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4">
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label className="text-sm font-medium">Tên mẫu</Label>
								<p className="text-sm text-gray-900">{template.name}</p>
							</div>
							<div>
								<Label className="text-sm font-medium">Mô tả</Label>
								<p className="text-sm text-gray-900">{template.description}</p>
							</div>
							<div>
								<Label className="text-sm font-medium">Trạng thái</Label>
								<p className="text-sm text-gray-900">
									<Badge
										className={
											template.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
										}
									>
										{template.active ? "Hoạt động" : "Không hoạt động"}
									</Badge>
								</p>
							</div>
							<div>
								<Label className="text-sm font-medium">Số mục</Label>
								<p className="text-sm text-gray-900">{template.items.length}</p>
							</div>
						</div>
					</div>
					<div className="space-y-4">
						<h3 className="text-lg font-medium">Kết quả xét nghiệm máu</h3>
						{template.items.map((item: Item) => (
							<div key={item.id} className="space-y-2">
								<Label>
									{item.label} {item.isRequired && <span className="text-red-500">*</span>}
								</Label>
								{item.type === "select" && item.options ? (
									<select
										className="w-full rounded-md border p-2"
										value={formData.bloodTestResults[item.id] || ""}
										onChange={(e) => handleInputChange(item.id, e.target.value)}
										required={item.isRequired}
									>
										<option value="">Chọn một tùy chọn</option>
										{item.options.map((option) => (
											<option key={option.id} value={option.label}>
												{option.label}
											</option>
										))}
									</select>
								) : (
									<Input
										type={item.type === "number" ? "number" : "text"}
										placeholder={item.placeholder}
										value={formData.bloodTestResults[item.id] || ""}
										onChange={(e) => handleInputChange(item.id, e.target.value)}
										required={item.isRequired}
										min={item.minValue}
										max={item.maxValue}
										minLength={item.minLength}
										maxLength={item.maxLength}
										pattern={item.pattern}
									/>
								)}
								<p className="text-sm text-gray-500">{item.description}</p>
							</div>
						))}
					</div>
					<div className="space-y-2">
						<Label>Ngày kết quả</Label>
						<Input
							type="date"
							value={formData.resultDate}
							onChange={(e) => setFormData((prev) => ({ ...prev, resultDate: e.target.value }))}
						/>
					</div>
					<div className="space-y-2">
						<Label>Ghi chú</Label>
						<Textarea
							value={formData.notes || ""}
							onChange={handleNotesChange}
							placeholder="Nhập ghi chú nếu có"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Hủy
					</Button>
					<Button onClick={handleSubmit} disabled={updateDonationResult.isPending}>
						{updateDonationResult.isPending ? "Đang cập nhật..." : "Cập nhật"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}