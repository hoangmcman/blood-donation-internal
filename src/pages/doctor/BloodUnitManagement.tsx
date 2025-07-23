"use client";

import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
	Edit,
	Eye,
	Filter,
	MoreHorizontal,
	X,
} from "lucide-react";
import { useState } from "react";

import UpdateBloodUnitDialog from "@/components/dialog/UpdateBloodUnitDialog";
import { ViewBloodUnitDetail } from "@/components/dialog/ViewBloodUnitDetail";
import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
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
import { BloodGroup } from "@/interfaces/blood";
import { BloodUnit, BloodUnitStatus } from "@/interfaces/inventory";
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

import { useGetBloodUnits } from "../../services/inventory";

interface FilterState {
	bloodType?: BloodGroup;
	status?: BloodUnitStatus;
	expired?: boolean;
}

export default function BloodUnitList() {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState<string | null>(null);
	const [viewBloodUnit, setViewBloodUnit] = useState<BloodUnit | null>(null);
	const [showFilters, setShowFilters] = useState(false);
	const [filters, setFilters] = useState<FilterState>({});

	const columns: ColumnDef<BloodUnit>[] = [
		{
			accessorKey: "member",
			header: "Họ và tên",
			cell: ({ row }) => `${row.original.member.lastName} ${row.original.member.firstName}`,
		},
		{
			accessorKey: "bloodType.group",
			header: "Nhóm máu",
			cell: ({ row }) => row.original.bloodType.group,
		},
		{
			accessorKey: "bloodType.rh",
			header: "Yếu tố Rh",
			cell: ({ row }) => row.original.bloodType.rh,
		},
		{
			accessorKey: "bloodComponentType",
			header: "Chế phẩm",
			cell: ({ row }) => {
				const componentType = row.original.bloodComponentType;
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

				return (
					<Badge className={`border ${getComponentTypeColor(componentType)}`}>
						{getComponentTypeLabel(componentType)}
					</Badge>
				);
			},
		},
		{
			accessorKey: "expiredDate",
			header: "Ngày hết hạn",
			cell: ({ row }) => {
				const expiredDate = new Date(row.getValue("expiredDate"));
				const isExpired = expiredDate < new Date();
				return (
					<span className={isExpired ? "text-red-600 font-medium" : "text-gray-900"}>
						{expiredDate.toLocaleDateString("vi-VN")}
					</span>
				);
			},
		},
		{
			id: "actions",
			header: "Hành động",
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Mở menu</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => setViewBloodUnit(row.original)}>
							<Eye className="mr-2 h-4 w-4" />
							Xem chi tiết
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => setIsUpdateDialogOpen(row.original.id)}>
							<Edit className="mr-2 h-4 w-4" />
							Cập nhật máu theo thành phần
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	const { data, isLoading, error } = useGetBloodUnits({
		page: Number(pagination.pageIndex) + 1,
		limit: Number(pagination.pageSize),
		bloodType: filters.bloodType,
		status: filters.status,
		expired: filters.expired,
	});

	const clearFilters = () => {
		setFilters({});
	};

	const hasActiveFilters = Object.values(filters).some(
		(value) => value !== undefined && value !== ""
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

	if (error) {
		return <div>Lỗi: {error.message}</div>;
	}

	return (
		<div className="w-full p-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold">Danh sách đơn vị máu</h1>
					<p className="text-gray-600 mt-1">Quản lý và theo dõi tất cả đơn vị máu trong hệ thống</p>
				</div>
				<Button
					variant={showFilters ? "default" : "outline"}
					onClick={() => setShowFilters(!showFilters)}
					className="flex items-center gap-2"
				>
					<Filter className="h-4 w-4" />
					{showFilters ? "Ẩn bộ lọc" : "Hiển thị bộ lọc"}
				</Button>
			</div>

			{/* Filters */}
			{showFilters && (
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="text-lg flex items-center justify-between">
							Bộ lọc tìm kiếm
							{hasActiveFilters && (
								<Button
									variant="ghost"
									size="sm"
									onClick={clearFilters}
									className="text-red-600 hover:text-red-700"
								>
									<X className="h-4 w-4 mr-1" />
									Xóa bộ lọc
								</Button>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="bloodType">Nhóm máu</Label>
								<Select
									value={filters.bloodType || ""}
									onValueChange={(value) =>
										setFilters((prev) => ({
											...prev,
											bloodType: value ? (value as BloodGroup) : undefined,
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Chọn nhóm máu" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="A">A</SelectItem>
										<SelectItem value="B">B</SelectItem>
										<SelectItem value="AB">AB</SelectItem>
										<SelectItem value="O">O</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="status">Trạng thái</Label>
								<Select
									value={filters.status || ""}
									onValueChange={(value) =>
										setFilters((prev) => ({
											...prev,
											status: value ? (value as BloodUnitStatus) : undefined,
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Chọn trạng thái" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="available">Có sẵn</SelectItem>
										<SelectItem value="used">Đã sử dụng</SelectItem>
										<SelectItem value="expired">Hết hạn</SelectItem>
										<SelectItem value="damaged">Hư hỏng</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="expired">Tình trạng hết hạn</Label>
								<Select
									value={filters.expired !== undefined ? filters.expired.toString() : ""}
									onValueChange={(value) =>
										setFilters((prev) => ({
											...prev,
											expired: value ? value === "true" : undefined,
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Chọn tình trạng" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="true">Đã hết hạn</SelectItem>
										<SelectItem value="false">Còn hạn</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

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
											Không tìm thấy đơn vị máu.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
					<div className="flex items-center justify-end space-x-2 py-4">
						<div className="flex-1 text-sm text-muted-foreground">
							Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
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

			{/* Update Dialog */}
			{isUpdateDialogOpen && (
				<UpdateBloodUnitDialog
					open={!!isUpdateDialogOpen}
					onOpenChange={(open: boolean) => setIsUpdateDialogOpen(open ? isUpdateDialogOpen : null)}
					bloodUnitId={isUpdateDialogOpen}
				/>
			)}

			{/* View Detail Dialog */}
			<ViewBloodUnitDetail
				open={!!viewBloodUnit}
				onOpenChange={(open: boolean) => !open && setViewBloodUnit(null)}
				bloodUnit={viewBloodUnit}
			/>
		</div>
	);
}
