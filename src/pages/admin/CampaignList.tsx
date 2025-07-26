"use client";

import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
	EyeIcon,
	MoreVerticalIcon,
	PencilIcon,
	PlusIcon,
	TrashIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Campaign } from "@/interfaces/campaign";
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

import { CreateCampaignDialog } from "../../components/dialog/CreateCampaignDialog";
import { EditCampaignDialog } from "../../components/dialog/EditCampaignDialog";
import { ViewCampaignDetail } from "../../components/dialog/ViewCampaignDetail";
import { useDeleteCampaign, useGetCampaigns } from "../../services/campaign";

const columns: ColumnDef<Campaign, any>[] = [
	{
		accessorKey: "name",
		header: "Tên chiến dịch",
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
						return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200";
					case "completed":
						return "bg-blue-100 text-blue-700 hover:bg-blue-200";
					case "ended":
						return "bg-red-100 text-red-700 hover:bg-red-200";
					default:
						return "bg-gray-100 text-gray-700 hover:bg-gray-200";
				}
			};

			return (
				<Badge className={getStatusColor(status)}>
					{status === "active"
						? "Hoạt động"
						: status === "not_started"
						? "Chưa bắt đầu"
						: status === "completed"
						? "Hoàn thành"
						: status === "ended"
						? "Đã kết thúc"
						: status}
				</Badge>
			);
		},
	},
	{
		accessorKey: "limitDonation",
		header: "Giới hạn quyên góp",
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
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showViewDialog, setShowViewDialog] = useState(false);
	const deleteMutation = useDeleteCampaign();

	const handleDelete = async () => {
		try {
			await deleteMutation.mutateAsync(campaign.id);
			toast.success("Xóa chiến dịch thành công");
		} catch (error) {
			toast.error("Xóa chiến dịch thất bại");
		} finally {
			setShowDeleteDialog(false);
		}
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
					<DropdownMenuItem onClick={() => setShowViewDialog(true)}>
						<EyeIcon className="h-4 w-4 mr-2" />
						Xem chi tiết
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setShowEditDialog(true)}>
						<PencilIcon className="h-4 w-4 mr-2" />
						Chỉnh sửa
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
						<TrashIcon className="h-4 w-4 mr-2" />
						Xóa
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<ViewCampaignDetail
				open={showViewDialog}
				onOpenChange={setShowViewDialog}
				campaignId={campaign.id}
			/>
			<EditCampaignDialog
				open={showEditDialog}
				onOpenChange={setShowEditDialog}
				campaign={campaign}
			/>
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn chiến dịch "
							{campaign.name}".
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

export default function CampaignList() {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const [showCreateDialog, setShowCreateDialog] = useState(false);
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

	const { data, isLoading, error } = useGetCampaigns({
		search: debouncedSearch,
		status: statusFilter as any,
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
	});

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
		return <div>Đang tải...</div>;
	}

	if (error) {
		return <div>Lỗi: {error.message}</div>;
	}

	return (
		<div className="w-full p-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Quản lý chiến dịch</h1>
			</div>

			{/* Filter Section */}
			<div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
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
							<SelectItem value="active">Hoạt động</SelectItem>
							<SelectItem value="not_started">Chưa bắt đầu</SelectItem>
							<SelectItem value="ended">Đã kết thúc</SelectItem>
						</SelectContent>
					</Select>
					<Button onClick={() => setShowCreateDialog(true)}>
						<PlusIcon className="h-4 w-4 mr-2" />
						Tạo chiến dịch mới
					</Button>
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
			<div className="flex items-center justify-end space-x-2 py-4">
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
			<CreateCampaignDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
		</div>
	);
}
