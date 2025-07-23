"use client";

import { Activity, CalendarDays, Clock, Droplets, FlaskConical, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface BloodUnit {
	id: string;
	createdAt: string;
	updatedAt: string;
	member: {
		firstName: string;
		lastName: string;
		bloodType: { group: string; rh: string } | null;
	};
	bloodType: { group: string; rh: string };
	bloodVolume: number;
	remainingVolume: number;
	bloodComponentType: string;
	isSeparated: boolean;
	parentWholeBlood?: string;
	expiredDate: string;
	status: string;
}

interface ViewBloodUnitDetailProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	bloodUnit: BloodUnit | null;
}

export function ViewBloodUnitDetail({ open, onOpenChange, bloodUnit }: ViewBloodUnitDetailProps) {
	if (!bloodUnit) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Chi tiết đơn vị máu</DialogTitle>
					</DialogHeader>
					<div>Không tìm thấy thông tin đơn vị máu</div>
				</DialogContent>
			</Dialog>
		);
	}

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "available":
				return "bg-emerald-500/10 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
			case "used":
				return "bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-100";
			case "expired":
				return "bg-red-500/10 text-red-700 border-red-200 hover:bg-red-100";
			case "damaged":
				return "bg-gray-500/10 text-gray-700 border-gray-200 hover:bg-gray-100";
			default:
				return "bg-gray-500/10 text-gray-700 border-gray-200 hover:bg-gray-100";
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status.toLowerCase()) {
			case "available":
				return "Có sẵn";
			case "used":
				return "Đã sử dụng";
			case "expired":
				return "Hết hạn";
			case "damaged":
				return "Hư hỏng";
			default:
				return status;
		}
	};

	const getComponentTypeLabel = (type: string) => {
		switch (type.toLowerCase()) {
			case "whole_blood":
				return "Máu toàn phần";
			case "red_cells":
				return "Hồng cầu";
			case "plasma":
				return "Huyết tương";
			case "platelets":
				return "Tiểu cầu";
			default:
				return type;
		}
	};

	const getComponentTypeColor = (type: string) => {
		switch (type.toLowerCase()) {
			case "whole_blood":
				return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
			case "red_cells":
				return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200";
			case "plasma":
				return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200";
			case "platelets":
				return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
			default:
				return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200";
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("vi-VN", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const isExpired = new Date(bloodUnit.expiredDate) < new Date();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="min-w-4xl max-w-6xl max-h-[90vh] overflow-y-auto">
				<DialogHeader className="pb-4">
					<DialogTitle className="text-2xl font-bold text-gray-900">
						Chi tiết đơn vị máu
					</DialogTitle>
					<p className="text-gray-600">ID: {bloodUnit.id}</p>
				</DialogHeader>

				<div className="space-y-6">
					{/* Status and Component Type */}
					<div className="flex gap-3">
						<Badge className={`border ${getStatusColor(bloodUnit.status)}`}>
							<Activity className="w-3 h-3 mr-1" />
							{getStatusLabel(bloodUnit.status)}
						</Badge>
						<Badge className={`border ${getComponentTypeColor(bloodUnit.bloodComponentType)}`}>
							<FlaskConical className="w-3 h-3 mr-1" />
							{getComponentTypeLabel(bloodUnit.bloodComponentType)}
						</Badge>
						{bloodUnit.isSeparated && (
							<Badge variant="outline" className="border-purple-200 text-purple-700">
								Đã tách thành phần
							</Badge>
						)}
					</div>

					<Separator />

					{/* Member Information */}
					<Card className="border-l-4 border-l-blue-500 py-0">
						<CardContent className="p-4">
							<div className="flex items-center space-x-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
									<User className="h-5 w-5 text-blue-600" />
								</div>
								<div className="flex-1">
									<h4 className="font-medium text-gray-900">Thông tin người hiến</h4>
									<p className="text-sm text-gray-600">
										{bloodUnit.member.lastName} {bloodUnit.member.firstName}
									</p>
									{bloodUnit.member.bloodType && (
										<p className="text-xs text-gray-500">
											Nhóm máu: {bloodUnit.member.bloodType.group}
											{bloodUnit.member.bloodType.rh}
										</p>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Blood Information */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<Card className="border-l-4 border-l-red-500 py-0">
							<CardContent className="p-4">
								<div className="flex items-center space-x-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
										<Droplets className="h-5 w-5 text-red-600" />
									</div>
									<div className="flex-1">
										<h4 className="font-medium text-gray-900">Nhóm máu</h4>
										<p className="text-sm text-gray-600">
											{bloodUnit.bloodType.group}
											{bloodUnit.bloodType.rh}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="border-l-4 border-l-purple-500 py-0">
							<CardContent className="p-4">
								<div className="flex items-center space-x-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
										<FlaskConical className="h-5 w-5 text-purple-600" />
									</div>
									<div className="flex-1">
										<h4 className="font-medium text-gray-900">Dung tích</h4>
										<p className="text-sm text-gray-600">
											{bloodUnit.remainingVolume}ml / {bloodUnit.bloodVolume}ml
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Date Information */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<Card className="border-l-4 border-l-green-500 py-0">
							<CardContent className="p-4">
								<div className="flex items-center space-x-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
										<CalendarDays className="h-5 w-5 text-green-600" />
									</div>
									<div className="flex-1">
										<h4 className="font-medium text-gray-900">Ngày tạo</h4>
										<p className="text-sm text-gray-600">{formatDate(bloodUnit.createdAt)}</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card
							className={`border-l-4 py-0 ${
								isExpired ? "border-l-red-500" : "border-l-orange-500"
							}`}
						>
							<CardContent className="p-4">
								<div className="flex items-center space-x-3">
									<div
										className={`flex h-10 w-10 items-center justify-center rounded-lg ${
											isExpired ? "bg-red-100" : "bg-orange-100"
										}`}
									>
										<Clock
											className={`h-5 w-5 ${isExpired ? "text-red-600" : "text-orange-600"}`}
										/>
									</div>
									<div className="flex-1">
										<h4 className="font-medium text-gray-900">Ngày hết hạn</h4>
										<p
											className={`text-sm ${
												isExpired ? "text-red-600 font-medium" : "text-gray-600"
											}`}
										>
											{formatDate(bloodUnit.expiredDate)}
										</p>
										{isExpired && <p className="text-xs text-red-500">Đã hết hạn</p>}
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Parent Blood Unit (if separated) */}
					{bloodUnit.parentWholeBlood && (
						<Card className="bg-gray-50 py-0">
							<CardContent className="p-4">
								<h4 className="font-medium text-gray-900 mb-2">Thông tin máu gốc</h4>
								<p className="text-sm text-gray-600">
									ID máu toàn phần gốc:{" "}
									<span className="font-mono">{bloodUnit.parentWholeBlood}</span>
								</p>
							</CardContent>
						</Card>
					)}

					{/* Last Updated */}
					<div className="text-xs text-gray-500 text-center pt-4 border-t">
						Cập nhật lần cuối: {formatDate(bloodUnit.updatedAt)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
