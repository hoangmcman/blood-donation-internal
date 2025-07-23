"use client";

import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
	MoreVerticalIcon,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { DonationResultTemplate, Item } from "@/interfaces/donation";
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

import UpdateDonationResultDialog from "../../components/dialog/UpdateDonationResultDialog";
import { useGetDonationResultTemplates } from "../../services/donationresulttemplates";

interface DonationResultTemplateActionsProps {
	template: DonationResultTemplate;
	onOpenDialog: (templateId: string) => void;
}

function DonationResultTemplateActions({
	template,
	onOpenDialog,
}: DonationResultTemplateActionsProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-8 w-8 p-0">
					<MoreVerticalIcon className="h-4 w-4" />
					<span className="sr-only">Mở menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => onOpenDialog(template.id)}>
					Xem và Cập nhật
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default function StaffDonationResultList({
	donationResultId,
}: {
	donationResultId: string;
}) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("");

	const { data, isLoading, error } = useGetDonationResultTemplates(
		pagination.pageIndex + 1,
		pagination.pageSize
	);

	const columns: ColumnDef<DonationResultTemplate>[] = [
		{
			accessorKey: "name",
			header: "Tên mẫu",
		},
		{
			accessorKey: "description",
			header: "Mô tả",
		},
		{
			accessorKey: "active",
			header: "Trạng thái",
			cell: ({ row }) => (
				<Badge
					className={
						row.getValue("active") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
					}
				>
					{row.getValue("active") ? "Hoạt động" : "Không hoạt động"}
				</Badge>
			),
		},
		{
			accessorKey: "createdAt",
			header: "Ngày tạo",
			cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString("vi-VN"),
		},
		{
			accessorKey: "items",
			header: "Số mục",
			cell: ({ row }) => {
				const items = row.getValue("items") as Item[] | undefined;
				return items ? items.length : 0;
			},
		},
		{
			id: "actions",
			header: "Hành động",
			cell: ({ row }) => (
				<DonationResultTemplateActions
					template={row.original}
					onOpenDialog={(templateId) => {
						setSelectedTemplateId(templateId);
						setIsDialogOpen(true);
					}}
				/>
			),
		},
	];

	const table = useReactTable({
		data: data?.data?.data || [],
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
		pageCount: data?.data?.meta.totalPages,
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
				<h1 className="text-2xl font-bold">Danh sách mẫu kết quả hiến máu</h1>
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
									Không tìm thấy mẫu kết quả hiến máu nào.
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
			<Toaster />
			<UpdateDonationResultDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				templateId={selectedTemplateId}
				donationResultId={donationResultId}
			/>
		</div>
	);
}
