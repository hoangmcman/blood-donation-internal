"use client";

import { useState } from "react";
import { toast } from "sonner";

import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { BloodGroup, BloodRh } from "@/interfaces/blood";
import {
	useGetEmergencyRequestById,
	useProvideContactsForEmergencyRequest,
} from "@/services/emergencyrequest";
import { useGetBloodUnits } from "@/services/inventory";

interface ProvideContactsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	requestId: string;
}

export function ProvideContactsDialog({
	open,
	onOpenChange,
	requestId,
}: ProvideContactsDialogProps) {
	const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

	// First get the emergency request to get the blood type parameters
	const {
		data: emergencyRequestData,
		isLoading: isEmergencyLoading,
		error: emergencyError,
	} = useGetEmergencyRequestById(requestId, { enabled: open });

	// Then get blood units based on the emergency request parameters
	const {
		data: bloodUnitsData,
		isLoading: isBloodUnitsLoading,
		error: bloodUnitsError,
	} = useGetBloodUnits(
		{
			bloodType: emergencyRequestData?.data?.bloodType.group,
			// bloodComponentType: emergencyRequestData?.data?.bloodTypeComponent as any,
			limit: 100, // Adjust limit as needed
			// Add other parameters from emergency request as needed
		},
		{
			enabled:
				open &&
				!!emergencyRequestData?.data?.bloodType?.group &&
				!!emergencyRequestData?.data?.bloodTypeComponent,
		}
	);

	const { mutate: provideContacts, isPending } = useProvideContactsForEmergencyRequest();

	const isLoading = isEmergencyLoading || isBloodUnitsLoading;
	const error = emergencyError || bloodUnitsError;

	// Extract unique members from blood units - filter duplicates by phone number
	const uniqueMembers =
		bloodUnitsData?.data?.data?.reduce((acc: any[], current) => {
			const existingMember = acc.find((item) => item.member.phone === current.member.phone);

			if (!existingMember) {
				acc.push(current);
			}
			return acc;
		}, []) || [];

	const handleMemberSelect = (member: any, checked: boolean) => {
		// Use the actual member ID now that it's available
		const memberId = member.member.id;

		setSelectedMemberIds((prev) => {
			if (checked) {
				return [...prev, memberId];
			} else {
				return prev.filter((id) => id !== memberId);
			}
		});
	};

	const handleSubmit = () => {
		if (selectedMemberIds.length === 0) {
			toast.error("Vui lòng chọn ít nhất một liên hệ");
			return;
		}

		const selectedMembers = uniqueMembers.filter((member) =>
			selectedMemberIds.includes(member.member.id)
		);

		const suggestedContacts = selectedMembers.map((member) => ({
			id: member.member.id,
			firstName: member.member.firstName,
			lastName: member.member.lastName,
			phone: member.member.phone,
			bloodType: member.member.bloodType || { group: "O" as BloodGroup, rh: "+" as BloodRh },
		}));

		provideContacts(
			{
				id: requestId,
				body: { suggestedContacts },
			},
			{
				onSuccess: () => {
					toast.success("Đã cung cấp thông tin liên hệ thành công");
					onOpenChange(false);
					setSelectedMemberIds([]);
				},
				onError: (error: any) => {
					toast.error(`Lỗi: ${error.message || "Không thể cung cấp thông tin liên hệ"}`);
				},
			}
		);
	};

	const handleClose = () => {
		onOpenChange(false);
		setSelectedMemberIds([]);
	};

	if (isLoading) {
		return (
			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-[800px]">
					<DialogHeader>
						<DialogTitle>Cung cấp thông tin liên hệ</DialogTitle>
					</DialogHeader>
					<div className="flex items-center justify-center p-8">
						<Loader />
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	if (error) {
		return (
			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-[800px]">
					<DialogHeader>
						<DialogTitle>Cung cấp thông tin liên hệ</DialogTitle>
					</DialogHeader>
					<div className="p-4">
						<p className="text-red-600">Lỗi: {error.message || "Không thể tải dữ liệu"}</p>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Cung cấp thông tin liên hệ cho yêu cầu khẩn cấp</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<p className="text-sm text-muted-foreground">
						Chọn những người hiến máu để cung cấp thông tin liên hệ cho yêu cầu khẩn cấp.
					</p>

					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">Chọn</TableHead>
									<TableHead>Tên người hiến</TableHead>
									<TableHead>Số điện thoại</TableHead>
									<TableHead>Nhóm máu</TableHead>
									<TableHead>Rh</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{uniqueMembers.length > 0 ? (
									uniqueMembers.map((member) => {
										const memberId = member.member.id;
										const isSelected = selectedMemberIds.includes(memberId);

										return (
											<TableRow key={member.id} className={isSelected ? "bg-muted/50" : ""}>
												<TableCell>
													<Checkbox
														checked={isSelected}
														onCheckedChange={(checked) =>
															handleMemberSelect(member, checked as boolean)
														}
													/>
												</TableCell>
												<TableCell className="font-medium">
													{member.member.lastName} {member.member.firstName}
												</TableCell>
												<TableCell>{member.member.phone}</TableCell>
												<TableCell>
													<Badge variant="outline">{member.member.bloodType?.group || "N/A"}</Badge>
												</TableCell>
												<TableCell>
													<Badge variant="outline">{member.member.bloodType?.rh || "N/A"}</Badge>
												</TableCell>
											</TableRow>
										);
									})
								) : (
									<TableRow>
										<TableCell colSpan={5} className="h-24 text-center">
											Không tìm thấy người hiến máu nào.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					{selectedMemberIds.length > 0 && (
						<div className="bg-muted/50 p-3 rounded-md">
							<p className="text-sm font-medium">
								Đã chọn {selectedMemberIds.length} người hiến máu
							</p>
						</div>
					)}

					<div className="flex justify-end space-x-2 pt-4">
						<Button variant="outline" onClick={handleClose} disabled={isPending}>
							Hủy
						</Button>
						<Button onClick={handleSubmit} disabled={selectedMemberIds.length === 0 || isPending}>
							{isPending ? "Đang xử lý..." : "Cung cấp thông tin liên hệ"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
