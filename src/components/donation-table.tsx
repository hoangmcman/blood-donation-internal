"use client";

import {
	Ban,
	Check,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
	Edit,
	Eye,
	MoreVerticalIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import UpdateDonationResultDialog from "@/components/dialog/UpdateDonationResultDialog";
import UpdateDonationStatus from "@/components/dialog/UpdateDonationStatus";
import ViewDonationDetail from "@/components/dialog/ViewDonationDetail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Campaign, CampaignStatus } from "@/interfaces/campaign";
import { DonationRequest } from "@/interfaces/donation";
import { useGetCampaigns } from "@/services/campaign";
import { useGetDonationRequests, useUpdateDonationStatus } from "@/services/donations";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";

import Loader from "./loader";

const getColumns = (): ColumnDef<DonationRequest>[] => [
	{
		accessorKey: "donor.firstName",
		header: "Tên người hiến",
		cell: ({ row }) => row.original.donor.firstName,
	},
	{
		accessorKey: "donor.lastName",
		header: "Họ người hiến",
		cell: ({ row }) => row.original.donor.lastName,
	},
	{
		accessorKey: "campaign.name",
		header: "Chiến dịch",
		cell: ({ row }) => row.original.campaign.name,
	},
	{
		accessorKey: "bloodType",
		header: "Nhóm máu",
		cell: ({ row }) => {
			const bloodGroup = row.original.donor.bloodType?.group;
			const bloodRh = row.original.donor.bloodType?.rh;
			return (bloodGroup && bloodRh) ? `${bloodGroup} ${bloodRh}` : "Nhóm máu chưa xác định";
		},
	},
	{
		accessorKey: "currentStatus",
		header: "Trạng thái",
		cell: ({ row }) => {
			const status = row.original.currentStatus;
			const getStatusColor = (status: string) => {
				switch (status.toLowerCase()) {
					case "completed":
						return "bg-green-100 text-green-700 border-green-200 hover:bg-green-50";
					case "rejected":
						return "bg-red-100 text-red-700 border-red-200 hover:bg-red-50";
					case "appointment_confirmed":
						return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-50";
					case "appointment_cancelled":
						return "bg-red-100 text-red-700 border-red-200 hover:bg-red-50";
					case "appointment_absent":
						return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-50";
					case "customer_cancelled":
						return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-50";
					case "customer_checked_in":
						return "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-50";
					case "result_returned":
						return "bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-50";
					case "no_show_after_checkin":
						return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-50";
					case "not_qualified":
						return "bg-red-100 text-red-700 border-red-200 hover:bg-red-50";
					default:
						return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-50";
				}
			};
			return (
				<Badge className={getStatusColor(status)}>
					{status === "completed"
						? "Lấy máu thành công, chưa trả kết quả"
						: status === "rejected"
						? "Request bị từ chối"
						: status === "appointment_confirmed"
						? "Đã xác nhận lịch hẹn"
						: status === "appointment_cancelled"
						? "Đã hủy lịch hẹn"
						: status === "appointment_absent"
						? "Vắng mặt"
						: status === "customer_cancelled"
						? "Khách hàng hủy"
						: status === "customer_checked_in"
						? "Khách hàng đã check-in"
						: status === "result_returned"
						? "Đã trả kết quả"
						: status === "no_show_after_checkin"
						? "Không xuất hiện sau check-in"
						: status === "not_qualified"
						? "Không đủ điều kiện"
						: status.charAt(0).toUpperCase() + status.slice(1)}
				</Badge>
			);
		},
	},
	{
		id: "bloodCollectionDate",
		header: "Ngày hiến máu",
		cell: ({ row }) =>
			row.original.campaign.bloodCollectionDate
				? new Date(row.original.campaign.bloodCollectionDate).toLocaleDateString("vi-VN", {
						year: "numeric",
						month: "short",
						day: "numeric",
				  })
				: "Không có",
	},
	{
		id: "actions",
		header: "Hành động",
		cell: ({ row }) => <DonationActionsCell donation={row.original} />,
	},
];

function DonationActionsCell({ donation }: { donation: DonationRequest }) {
	const [openView, setOpenView] = useState(false);
	const [openUpdate, setOpenUpdate] = useState(false);
	const [openResultDialog, setOpenResultDialog] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
	
	const updateStatusMutation = useUpdateDonationStatus();

	const handleConfirmStatusUpdate = async () => {
		if (!selectedStatus) return;
		
		try {
			await updateStatusMutation.mutateAsync({
				id: donation.id,
				statusData: { status: selectedStatus }
			});
			setShowConfirmDialog(false);
			setSelectedStatus(null);
		} catch (error) {
			console.error("Failed to update status:", error);
		}
	};

	const handleStatusUpdate = (status: string) => {
		setSelectedStatus(status);
		if (status === "not_qualified" || status === "no_show_after_checkin") {
			setShowConfirmDialog(true);
		} else if (status === "customer_checked_in") {
			setOpenUpdate(true);
		} else if (status === "completed") {
			setOpenResultDialog(true);
		} else {
			setOpenUpdate(true);
		}
	};

	const handleUpdateDialogChange = (open: boolean) => {
		setOpenUpdate(open);
		if (!open) setSelectedStatus(null);
	};

	const getConfirmationMessage = (status: string | null) => {
		if (!status) return "";
		return status === "not_qualified" 
			? "Bạn có chắc chắn muốn đánh dấu người hiến máu này là không đủ điều kiện?"
			: "Bạn có chắc chắn muốn đánh dấu người hiến máu này là không xuất hiện sau check-in?";
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<MoreVerticalIcon className="h-4 w-4" />
						<span className="sr-only">Mở menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setOpenView(true)}>
						<Eye className="h-4 w-4" />
						Xem chi tiết
					</DropdownMenuItem>

					{donation.currentStatus !== "completed" &&
						donation.currentStatus !== "result_returned" && (
							<>
								{donation.currentStatus === "appointment_confirmed" && (
									<DropdownMenuItem onClick={() => handleStatusUpdate("appointment_confirmed")}>
										<Edit className="h-4 w-4" />
										Cập nhật trạng thái
									</DropdownMenuItem>
								)}
								{donation.currentStatus === "customer_checked_in" && (
									<>
										<DropdownMenuItem onClick={() => handleStatusUpdate("customer_checked_in")}>
											<Check className="h-4 w-4" />
											Hoàn tất
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => handleStatusUpdate("not_qualified")}>
											<Ban className="h-4 w-4" />
											Không đủ điều kiện
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => handleStatusUpdate("no_show_after_checkin")}>
											<Ban className="h-4 w-4" />
											Không xuất hiện sau check-in
										</DropdownMenuItem>
									</>
								)}
							</>
						)}

					{donation.currentStatus === "completed" && (
						<DropdownMenuItem onClick={() => handleStatusUpdate("completed")}>
							<Edit className="h-4 w-4" />
							Cập nhật trạng thái
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<ViewDonationDetail open={openView} onOpenChange={setOpenView} donationId={donation.id} />
			<UpdateDonationStatus
				open={openUpdate}
				onOpenChange={handleUpdateDialogChange}
				donationId={donation.id}
				selectedStatus={selectedStatus!}
			/>
			<UpdateDonationResultDialog
				open={openResultDialog}
				onOpenChange={setOpenResultDialog}
				memberId={donation.id}
				memberName={donation.donor.firstName + " " + donation.donor.lastName}
			/>

			<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận thay đổi trạng thái</AlertDialogTitle>
						<AlertDialogDescription>
							{getConfirmationMessage(selectedStatus)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setSelectedStatus(null)}>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirmStatusUpdate}>
							{updateStatusMutation.isPending ? (
								<>
									<div className="mr-2 h-4 w-4">
										<Loader />
									</div>
									Đang xử lý...
								</>
							) : (
								"Xác nhận"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

export function DonationTable() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});

	// Get initial filter values from URL params or use defaults
	const [statusFilter, setStatusFilter] = useState<string>(
		searchParams.get("status") || "appointment_confirmed"
	);
	const [campaignFilter, setCampaignFilter] = useState<string>(
		searchParams.get("campaignId") || ""
	);

	// Update URL when filters change
	useEffect(() => {
		const params = new URLSearchParams(searchParams);

		if (statusFilter) {
			params.set("status", statusFilter);
		} else {
			params.delete("status");
		}

		if (campaignFilter) {
			params.set("campaignId", campaignFilter);
		} else {
			params.delete("campaignId");
		}

		setSearchParams(params, { replace: true });
	}, [statusFilter, campaignFilter, searchParams, setSearchParams]);

	// Fetch campaigns for filter dropdown (only active campaigns)
	const { data: campaignsData } = useGetCampaigns({ status: CampaignStatus.ENDED });
	const activeCampaigns = Array.isArray(campaignsData?.data.data) ? campaignsData.data.data : [];

	// Build query parameters for donation requests
	const queryParams = {
		status: statusFilter || undefined,
		campaignId: campaignFilter || undefined,
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
	};

	const { data: donationData, isLoading, error } = useGetDonationRequests(queryParams);
	const donationRequests = donationData?.items || [];
	const totalCount = donationData?.total || 0;

	// Reset pagination when filters change
	const resetPagination = () => {
		setPagination({ pageIndex: 0, pageSize: 10 });
	};

	const handleStatusChange = (value: string) => {
		setStatusFilter(value);
		resetPagination();
	};

	const handleCampaignChange = (value: string) => {
		setCampaignFilter(value);
		resetPagination();
	};

	const handleClearFilters = () => {
		setStatusFilter("appointment_confirmed");
		setCampaignFilter("");
		resetPagination();
	};

	const table = useReactTable<DonationRequest>({
		data: donationRequests,
		columns: getColumns(),
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			pagination,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getRowId: (row) => row.id,
		manualPagination: true,
		pageCount: Math.ceil(totalCount / pagination.pageSize),
	});

	if (error) return <div>Lỗi: {error?.message || "Không thể tải danh sách yêu cầu hiến máu"}</div>;

	return (
		<div className="w-full">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Quản lý yêu cầu hiến máu</h1>
			</div>

			{/* Filter Section */}
			<div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
				<div className="flex-1">
					<label className="block text-sm font-medium mb-2">Trạng thái</label>
					<Select value={statusFilter} onValueChange={handleStatusChange}>
						<SelectTrigger>
							<SelectValue placeholder="Chọn trạng thái" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="appointment_confirmed">Đã xác nhận lịch hẹn</SelectItem>
							<SelectItem value="customer_checked_in">Khách hàng đã check-in</SelectItem>
							<SelectItem value="completed">Lấy máu thành công, chưa trả kết quả</SelectItem>
							<SelectItem value="result_returned">Đã trả kết quả</SelectItem>
							<SelectItem value="customer_cancelled">Khách hàng hủy</SelectItem>
							<SelectItem value="appointment_cancelled">Đã hủy lịch hẹn</SelectItem>
							<SelectItem value="appointment_absent">Vắng mặt</SelectItem>
							<SelectItem value="no_show_after_checkin">Không xuất hiện sau check-in</SelectItem>
							<SelectItem value="not_qualified">Không đủ điều kiện</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex-1">
					<label className="block text-sm font-medium mb-2">Chiến dịch</label>
					<Select value={campaignFilter} onValueChange={handleCampaignChange}>
						<SelectTrigger>
							<SelectValue placeholder="Chọn chiến dịch" />
						</SelectTrigger>
						<SelectContent>
							{activeCampaigns.map((campaign: Campaign) => (
								<SelectItem key={campaign.id} value={campaign.id}>
									{campaign.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-end">
					<Button variant="outline" onClick={handleClearFilters}>
						Xóa bộ lọc
					</Button>
				</div>
			</div>

			{isLoading && (
				<div className="flex items-center justify-center">
					<Loader />
				</div>
			)}

			{!isLoading && (
				<>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => (
											<TableHead key={header.id}>
												{header.isPlaceholder
													? null
													: flexRender(header.column.columnDef.header, header.getContext())}
											</TableHead>
										))}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows?.length ? (
									<SortableContext
										items={table.getRowModel().rows.map((row) => row.id)}
										strategy={verticalListSortingStrategy}
									>
										{table.getRowModel().rows.map((row) => (
											<TableRow key={row.id}>
												{row.getVisibleCells().map((cell) => (
													<TableCell key={cell.id}>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												))}
											</TableRow>
										))}
									</SortableContext>
								) : (
									<TableRow>
										<TableCell
											colSpan={table.getVisibleLeafColumns().length}
											className="h-24 text-center"
										>
											Không tìm thấy yêu cầu hiến máu.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>

					<div className="flex items-center justify-end space-x-2 py-4">
						<div className="flex-1 text-sm text-muted-foreground">
							Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
							{totalCount > 0 && ` • Tổng ${totalCount} yêu cầu`}
						</div>
						<div className="space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								<ChevronsLeftIcon className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<ChevronLeftIcon className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								<ChevronRightIcon className="h-4 w-4" />
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
							>
								<ChevronsRightIcon className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
