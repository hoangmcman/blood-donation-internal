"use client";

import { CalendarDays, Clock, ExternalLink, ImageIcon, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { useGetCampaignById } from "../../services/campaign";

interface ViewCampaignDetailProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	campaignId: string;
}

type Campaign = {
	id: string;
	name: string;
	description?: string;
	startDate: string;
	endDate?: string;
	status: string;
	banner: string;
	location: string;
	limitDonation: number;
	bloodCollectionDate?: string;
};

export function ViewCampaignDetail({ open, onOpenChange, campaignId }: ViewCampaignDetailProps) {
	const { data, isLoading, error } = useGetCampaignById(campaignId);

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "active":
				return "bg-emerald-500/10 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
			case "inactive":
				return "bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-100";
			case "completed":
				return "bg-blue-500/10 text-blue-700 border-blue-200 hover:bg-blue-100";
			case "cancelled":
				return "bg-red-500/10 text-red-700 border-red-200 hover:bg-red-100";
			default:
				return "bg-gray-500/10 text-gray-700 border-gray-200 hover:bg-gray-100";
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("vi-VN", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (isLoading) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Campaign Details</DialogTitle>
					</DialogHeader>
					<div>Loading...</div>
				</DialogContent>
			</Dialog>
		);
	}

	if (error || !data?.success || !data?.data) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Campaign Details</DialogTitle>
					</DialogHeader>
					<div>Error: {error?.message || "Failed to load campaign details"}</div>
				</DialogContent>
			</Dialog>
		);
	}

	// ép kiểu campaign để tránh lỗi
	const campaign = data.data as Campaign;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="min-w-4xl max-w-6xl max-h-[90vh] overflow-y-auto p-0">
				<div className="relative">
					{/* Banner Image */}
					<div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-red-500 to-red-600">
						{campaign.banner ? (
							<img
								src={campaign.banner}
								alt={campaign.name}
								className="h-full w-full object-cover"
							/>
						) : (
							<div className="flex h-full items-center justify-center">
								<div className="flex flex-col items-center text-white">
									<ImageIcon className="mb-2 h-12 w-12" />
									<span className="text-sm">No Banner Image</span>
								</div>
							</div>
						)}

						{/* Status Badge Overlay */}
						<div className="absolute top-4 right-4"></div>
					</div>

					{/* Content */}
					<div className="p-6">
						<DialogHeader className="mb-6 text-left">
							<DialogTitle className="text-2xl font-bold text-gray-900">
								{campaign.name}
							</DialogTitle>
							<div>
								<Badge
									className={`${getStatusColor(campaign.status)} border font-medium shadow-lg`}
								>
									{campaign.status}
								</Badge>
							</div>
							{campaign.description && (
								<p className="mt-2 text-gray-600 leading-relaxed">{campaign.description}</p>
							)}
						</DialogHeader>

						<div className="space-y-6">
							{/* Key Information Cards */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								{/* Date Information */}
								<Card className="border-l-4 border-l-blue-500 shadow-sm py-0">
									<CardContent className="p-4">
										<div className="flex items-center space-x-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
												<CalendarDays className="h-5 w-5 text-blue-600" />
											</div>
											<div className="flex-1">
												<h4 className="font-medium text-gray-900">Thời gian</h4>
												<p className="text-sm text-gray-600">
													{formatDate(campaign.startDate)}
													{campaign.endDate && <span> - {formatDate(campaign.endDate)}</span>}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Location Information */}
								<Card className="border-l-4 border-l-green-500 shadow-sm py-0">
									<CardContent className="p-4">
										<div className="flex items-center space-x-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
												<MapPin className="h-5 w-5 text-green-600" />
											</div>
											<div className="flex-1">
												<h4 className="font-medium text-gray-900">Địa điểm</h4>
												<p className="text-sm text-gray-600">{campaign.location}</p>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Donation Limit */}
								<Card className="border-l-4 border-l-purple-500 shadow-sm py-0">
									<CardContent className="p-4">
										<div className="flex items-center space-x-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
												<Users className="h-5 w-5 text-purple-600" />
											</div>
											<div className="flex-1">
												<h4 className="font-medium text-gray-900">Giới hạn hiến máu</h4>
												<p className="text-sm text-gray-600">{campaign.limitDonation} người</p>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Blood Collection Date */}
								<Card className="border-l-4 border-l-red-500 shadow-sm py-0">
									<CardContent className="p-4">
										<div className="flex items-center space-x-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
												<Clock className="h-5 w-5 text-red-600" />
											</div>
											<div className="flex-1">
												<h4 className="font-medium text-gray-900">Ngày lấy máu</h4>
												<p className="text-sm text-gray-600">
													{campaign.bloodCollectionDate
														? formatDate(campaign.bloodCollectionDate)
														: "Chưa xác định"}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>

							<Separator />

							{/* Banner Link */}
							{campaign.banner && (
								<div className="rounded-lg bg-gray-50 p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-3">
											<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200">
												<ExternalLink className="h-4 w-4 text-gray-600" />
											</div>
											<div>
												<h4 className="font-medium text-gray-900">Banner URL</h4>
												<p className="text-xs text-gray-600">Xem banner gốc</p>
											</div>
										</div>
										<a
											href={campaign.banner}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 hover:text-blue-600"
										>
											<ExternalLink className="mr-2 h-4 w-4" />
											Xem Banner
										</a>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
