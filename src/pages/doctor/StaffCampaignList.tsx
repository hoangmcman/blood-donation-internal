"use client";

import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
	Eye,
	MoreVerticalIcon,
	Stethoscope,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";

import { ViewCampaignDetail } from "../../components/dialog/ViewCampaignDetail";
import { useGetCampaigns } from "../../services/campaign";

interface Campaign {
	id: string;
	name: string;
	description?: string;
	startDate: string;
	endDate?: string;
	status: string;
	banner: string;
	location: string;
	limitDonation: number;
}

const columns: ColumnDef<Campaign>[] = [
	{
		accessorKey: "name",
		header: "Tên chiến dịch",
	},
	{
		accessorKey: "startDate",
		header: "Ngày bắt đầu",
		cell: ({ row }) =>
			new Date(row.getValue("startDate")).toLocaleDateString("vi-VN", {
				year: "numeric",
				month: "short",
				day: "2-digit",
			}),
	},
	{
		accessorKey: "endDate",
		header: "Ngày kết thúc",
		cell: ({ row }) =>
			row.getValue("endDate")
				? new Date(row.getValue("endDate")).toLocaleDateString("vi-VN")
				: "Không có",
	},
	{
		accessorKey: "status",
		header: "Trạng thái",
		cell: ({ row }) => {
			const status = row.getValue("status") as string;

			const getStatusColor = (status: string) => {
				switch (status.toLowerCase()) {
					case "active":
						return "bg-green-100 text-green-700 hover:bg-green-200";
					case "not_started":
						return "bg-blue-100 text-blue-700 hover:bg-blue-200";
					case "ended":
						return "bg-gray-100 text-gray-700 hover:bg-gray-200";
					case "inactive":
						return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200";
					case "completed":
						return "bg-blue-100 text-blue-700 hover:bg-blue-200";
					case "cancelled":
						return "bg-red-100 text-red-700 hover:bg-red-200";
					default:
						return "bg-gray-100 text-gray-700 hover:bg-gray-200";
				}
			};

			return (
				<Badge className={getStatusColor(status)}>
					{status === "active"
						? "Đang diễn ra"
						: status === "not_started"
						? "Chưa bắt đầu"
						: status === "ended"
						? "Đã kết thúc"
						: status === "inactive"
						? "Không hoạt động"
						: status === "completed"
						? "Hoàn thành"
						: status === "cancelled"
						? "Đã hủy"
						: status}
				</Badge>
			);
		},
	},
	{
		id: "actions",
		header: "Hành động",
		cell: ({ row }) => <CampaignActions campaign={row.original} />,
	},
];

interface CampaignActionsProps {
	campaign: Campaign;
}

function CampaignActions({ campaign }: CampaignActionsProps) {
	const navigate = useNavigate();
	const [viewDetailOpen, setViewDetailOpen] = useState(false);

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
					<DropdownMenuItem onClick={() => setViewDetailOpen(true)}>
						<Eye className="h-4 w-4" />
						Xem chi tiết chiến dịch
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => navigate(`/staff/campaign/${campaign.id}/donation-requests`)}
					>
						<Stethoscope className="h-4 w-4" />
						Xem yêu cầu hiến máu
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<ViewCampaignDetail
				open={viewDetailOpen}
				onOpenChange={setViewDetailOpen}
				campaignId={campaign.id}
			/>
		</>
	);
}

export default function StaffCampaignList() {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const [statusFilter, setStatusFilter] = useState<string>("active");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [debouncedSearch, setDebouncedSearch] = useState<string>("");

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
		}, 500);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Reset pagination when filters change
	useEffect(() => {
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	}, [statusFilter, debouncedSearch]);

	const { data, isLoading, error } = useGetCampaigns(
		Number(pagination.pageIndex) + 1,
		Number(pagination.pageSize),
		debouncedSearch || undefined, // search
		statusFilter // status
	);

	const table = useReactTable({
		data: data?.data.data || [],
		columns,
		state: {
			sorting,
			columnVisibility,
			pagination,
		},
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getRowId: (row) => row.id,
		manualPagination: true,
		pageCount: data?.data.meta.totalPages,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Loader />
			</div>
		);
	}

	if (error) {
		return <div>Lỗi: {error.message}</div>;
	}

	return (
		<div className="w-full p-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Xem chiến dịch để cập nhật đơn vị máu</h1>
			</div>

			{/* Filter Section */}
			<div className="flex flex-col sm:flex-row gap-4 mb-4">
				<div className="flex-1">
					<Input
						placeholder="Tìm kiếm theo tên, mô tả hoặc địa điểm..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="max-w-sm"
					/>
				</div>
				<div className="flex gap-2">
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Chọn trạng thái" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="active">Đang diễn ra</SelectItem>
							<SelectItem value="not_started">Chưa bắt đầu</SelectItem>
							<SelectItem value="ended">Đã kết thúc</SelectItem>
						</SelectContent>
					</Select>
					{(searchQuery || statusFilter !== "active") && (
						<Button
							variant="outline"
							onClick={() => {
								setSearchQuery("");
								setStatusFilter("active");
							}}
						>
							Xóa bộ lọc
						</Button>
					)}
				</div>
			</div>

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
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									{searchQuery || statusFilter !== "active"
										? `Không tìm thấy chiến dịch nào với bộ lọc hiện tại.`
										: "Không tìm thấy chiến dịch nào."}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-between py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					{data?.data.meta && (
						<span>
							Hiển thị {data.data.meta.total} chiến dịch • Trang{" "}
							{table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
						</span>
					)}
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
			<Toaster />
		</div>
	);
}
