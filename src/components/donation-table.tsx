"use client";

import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
	Edit,
	Eye,
	MoreVerticalIcon,
} from "lucide-react";
import { useState } from "react";

import UpdateDonationStatus from "@/components/dialog/UpdateDonationStatus";
import ViewDonationDetail from "@/components/dialog/ViewDonationDetail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useGetDonationRequests } from "@/services/donations";
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
import { useSearchParams } from "react-router-dom";

import Loader from "./loader";

const getColumns = (meta?: {
	onView?: (id: string) => void;
	onUpdate?: (id: string, date: string) => void;
}): ColumnDef<DonationRequest>[] => [
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
			cell: ({ }) => "Không có", // Vì DonationRequest không có bloodType, nên hiện tạm "Không có"
		},
		{
			accessorKey: "currentStatus",
			header: "Trạng thái",
			cell: ({ row }) => {
				const status = row.original.currentStatus;
				const getStatusColor = (status: string) => {
					switch (status.toLowerCase()) {
						case "pending":
							return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-50";
						case "completed":
							return "bg-green-100 text-green-700 border-green-200 hover:bg-green-50";
						case "rejected":
							return "bg-red-100 text-red-700 border-red-200 hover:bg-red-50";
						default:
							return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-50";
					}
				};
				return (
					<Badge className={getStatusColor(status)}>
						{status === "pending"
							? "Request chờ duyệt"
							: status === "completed"
								? "Lấy máu thành công, chưa trả kết quả"
								: status === "rejected"
									? "Request bị từ chối"
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
			cell: ({ row }) => {
				const [openView, setOpenView] = useState(false);
				const [openUpdate, setOpenUpdate] = useState(false);
				const donation = row.original;

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
								<DropdownMenuItem
									onClick={() => {
										setOpenView(true);
										meta?.onView?.(donation.id);
									}}
								>
									<Eye className="h-4 w-4" />
									Xem chi tiết
								</DropdownMenuItem>

								{/* ✅ Ẩn khi đã completed */}
								{donation.currentStatus !== "completed" && donation.currentStatus !== "result_returned" && (
									<DropdownMenuItem
										onClick={() => {
											setOpenUpdate(true);
											meta?.onUpdate?.(donation.id, donation.appointmentDate);
										}}
									>
										<Edit className="h-4 w-4" />
										Cập nhật trạng thái
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>

						<ViewDonationDetail
							open={openView}
							onOpenChange={setOpenView}
							donationId={donation.id}
						/>

						<UpdateDonationStatus
							open={openUpdate}
							onOpenChange={setOpenUpdate}
							donationId={donation.id}
						/>
					</>
				);
			},
		},
	];

export function DonationTable({
	onView,
	onUpdate,
}: {
	onView?: (id: string) => void;
	onUpdate?: (id: string, date: string) => void;
}) {
	const [searchParams, setSearchParams] = useSearchParams();
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [pagination, setPagination] = useState({
		pageIndex: Number(searchParams.get("page") || 0),
		pageSize: 10,
	});

	// Filter states
	const statusFilter = searchParams.get("status") || "";
	const campaignFilter = searchParams.get("campaignId") || "";

	// Fetch campaigns for filter dropdown (only active campaigns)
	const { data: campaignsData } = useGetCampaigns({ status: CampaignStatus.ACTIVE });
	const activeCampaigns = Array.isArray(campaignsData?.data.data) ? campaignsData.data.data : [];

	console.log("This is testing", activeCampaigns);

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
		setSearchParams((prev) => {
			prev.set("page", "1");
			return prev;
		});
	};

	const handleStatusChange = (value: string) => {
		setSearchParams((prev) => {
			if (value) {
				prev.set("status", value);
			} else {
				prev.delete("status");
			}
			prev.set("page", "1");
			return prev;
		});
		resetPagination();
	};

	const handleCampaignChange = (value: string) => {
		setSearchParams((prev) => {
			if (value) {
				prev.set("campaignId", value);
			} else {
				prev.delete("campaignId");
			}
			prev.set("page", "1");
			return prev;
		});
		resetPagination();
	};

	const table = useReactTable<DonationRequest>({
		data: donationRequests,
		columns: getColumns({ onView, onUpdate }),
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
		<div className="w-full p-4">
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
							<SelectItem value="pending">Request chờ duyệt</SelectItem>
							<SelectItem value="completed">Lấy máu thành công, chưa trả kết quả</SelectItem>
							<SelectItem value="rejected">Request bị từ chối</SelectItem>
							<SelectItem value="appointment_confirmed">Đã xác nhận lịch hẹn</SelectItem>
							<SelectItem value="appointment_cancelled">Đã hủy lịch hẹn</SelectItem>
							<SelectItem value="appointment_absent">Vắng mặt</SelectItem>
							<SelectItem value="customer_cancelled">Khách hàng hủy</SelectItem>
							<SelectItem value="customer_checked_in">Khách hàng đã check-in</SelectItem>
							<SelectItem value="result_returned">Đã trả kết quả</SelectItem>
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
					<Button
						variant="outline"
						onClick={() => {
							setSearchParams({});
							resetPagination();
						}}
					>
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