import { CalendarDays, Clock, FileText, Heart, MapPin, Phone, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDonationRequestById } from "@/services/donations";

interface ViewDonationDetailProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	donationId: string;
}

export default function ViewDonationDetail({
	open,
	onOpenChange,
	donationId,
}: ViewDonationDetailProps) {
	const { data, isLoading, error } = useGetDonationRequestById(donationId);

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "pending":
				return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-50";
			case "rejected":
				return "bg-red-100 text-red-700 border-red-200 hover:bg-red-50";
			case "completed":
				return "bg-green-100 text-green-700 border-green-200 hover:bg-green-50";
			case "result_returned":
				return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-50";
			case "appointment_confirmed":
				return "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-50";
			case "appointment_cancelled":
				return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-50";
			case "appointment_absent":
				return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-50";
			case "customer_cancelled":
				return "bg-red-100 text-red-700 border-red-200 hover:bg-red-50";
			case "customer_checked_in":
				return "bg-green-100 text-green-700 border-green-200 hover:bg-green-50";
			default:
				return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-50";
		}
	};

	const getStatusLabel = (status: string): string => {
		const statusLabels: Record<string, string> = {
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

	if (isLoading) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[700px]">
					<DialogHeader>
						<DialogTitle>Chi tiết yêu cầu hiến máu</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Card>
								<CardHeader>
									<Skeleton className="h-5 w-32" />
								</CardHeader>
								<CardContent className="space-y-3">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<Skeleton className="h-5 w-32" />
								</CardHeader>
								<CardContent className="space-y-3">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
								</CardContent>
							</Card>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	if (error || !data) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[700px]">
					<DialogHeader>
						<DialogTitle>Chi tiết yêu cầu hiến máu</DialogTitle>
					</DialogHeader>
					<Card>
						<CardContent className="pt-6">
							<div className="text-center text-red-600">
								<FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p>Lỗi: {error?.message || "Không thể tải chi tiết yêu cầu hiến máu"}</p>
							</div>
						</CardContent>
					</Card>
				</DialogContent>
			</Dialog>
		);
	}

	const donation = data;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
				<DialogHeader className="pb-4">
					<DialogTitle className="text-xl font-semibold">Chi tiết yêu cầu hiến máu</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Status Card */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-lg flex items-center gap-2">
								<Heart className="h-5 w-5 text-red-500" />
								Trạng thái hiện tại
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Badge className={getStatusColor(donation.currentStatus || "pending")}>
								{getStatusLabel(donation.currentStatus || "pending")}
							</Badge>
						</CardContent>
					</Card>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Campaign Information */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-lg flex items-center gap-2">
									<FileText className="h-5 w-5 text-blue-500" />
									Thông tin chiến dịch
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<div className="flex items-start gap-2">
										<span className="text-sm font-medium text-muted-foreground min-w-20">Tên:</span>
										<span className="text-sm font-medium">
											{donation.campaign?.name || "Không xác định"}
										</span>
									</div>
								</div>

								<Separator />

								<div className="space-y-2">
									<div className="flex items-start gap-2">
										<span className="text-sm font-medium text-muted-foreground min-w-20">
											Mô tả:
										</span>
										<span className="text-sm">{donation.campaign?.description || "Không có"}</span>
									</div>
								</div>

								<Separator />

								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<CalendarDays className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm font-medium text-muted-foreground">Ngày bắt đầu:</span>
										<span className="text-sm">
											{donation.campaign?.startDate
												? new Date(donation.campaign.startDate).toLocaleDateString("vi-VN", {
														year: "numeric",
														month: "long",
														day: "numeric",
												  })
												: "Không có"}
										</span>
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<CalendarDays className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm font-medium text-muted-foreground">
											Ngày kết thúc:
										</span>
										<span className="text-sm">
											{donation.campaign?.endDate
												? new Date(donation.campaign.endDate).toLocaleDateString("vi-VN", {
														year: "numeric",
														month: "long",
														day: "numeric",
												  })
												: "Không có"}
										</span>
									</div>
								</div>

								<Separator />

								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<MapPin className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm font-medium text-muted-foreground">Địa điểm:</span>
										<span className="text-sm">{donation.campaign?.location || "Không có"}</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Donor Information */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-lg flex items-center gap-2">
									<User className="h-5 w-5 text-green-500" />
									Thông tin người hiến máu
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<div className="flex items-start gap-2">
										<span className="text-sm font-medium text-muted-foreground min-w-20">
											Họ tên:
										</span>
										<span className="text-sm font-medium">
											{donation.donor?.lastName || ""}{" "}
											{donation.donor?.firstName || "Không xác định"}
										</span>
									</div>
								</div>

								<Separator />

								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Heart className="h-4 w-4 text-red-500" />
										<span className="text-sm font-medium text-muted-foreground">Nhóm máu:</span>
										<span className="text-sm font-medium">
											{donation.donor?.bloodType?.group || "Không có"}
											{donation.donor?.bloodType?.rh || ""}
										</span>
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<Phone className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm font-medium text-muted-foreground">Điện thoại:</span>
										<span className="text-sm">{donation.donor?.phone || "Không có"}</span>
									</div>
								</div>

								<Separator />

								<div className="space-y-2">
									<div className="flex items-start gap-2">
										<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
										<div className="flex-1">
											<span className="text-sm font-medium text-muted-foreground">Địa chỉ:</span>
											<div className="text-sm space-y-1 mt-1">
												<div>Phường/Xã: {donation.donor?.wardName || "Không có"}</div>
												<div>Quận/Huyện: {donation.donor?.districtName || "Không có"}</div>
												<div>Tỉnh/TP: {donation.donor?.provinceName || "Không có"}</div>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Timeline Information */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-lg flex items-center gap-2">
								<Clock className="h-5 w-5 text-orange-500" />
								Thông tin thời gian
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<CalendarDays className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm font-medium text-muted-foreground">Ngày tạo:</span>
									</div>
									<span className="text-sm font-medium">
										{new Date(donation.createdAt).toLocaleDateString("vi-VN", {
											year: "numeric",
											month: "long",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<CalendarDays className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm font-medium text-muted-foreground">Ngày hẹn:</span>
									</div>
									<span className="text-sm font-medium">
										{donation.appointmentDate
											? new Date(donation.appointmentDate).toLocaleDateString("vi-VN", {
													year: "numeric",
													month: "long",
													day: "numeric",
													hour: "2-digit",
													minute: "2-digit",
											  })
											: "Chưa có lịch hẹn"}
									</span>
								</div>

								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<CalendarDays className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm font-medium text-muted-foreground">Cập nhật:</span>
									</div>
									<span className="text-sm font-medium">
										{new Date(donation.updatedAt).toLocaleDateString("vi-VN", {
											year: "numeric",
											month: "long",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</DialogContent>
		</Dialog>
	);
}
