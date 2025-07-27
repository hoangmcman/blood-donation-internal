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

import { CreateBlogDialog } from "@/components/dialog/CreateBlogDialog";
import { EditBlogDialog } from "@/components/dialog/EditBlogDialog";
import { ViewBlogDetail } from "@/components/dialog/ViewBlogDetail";
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

import { Blog, useDeleteBlog, useGetBlogs } from "../../services/blog";

const columns: ColumnDef<Blog, any>[] = [
	{
		accessorKey: "title",
		header: "Tiêu đề",
	},
	{
		accessorKey: "publishedAt",
		header: "Ngày xuất bản",
		cell: ({ row }) => new Date(row.getValue("publishedAt")).toLocaleDateString("vi-VN"),
	},
	{
		accessorKey: "imageUrl",
		header: "Hình ảnh",
		cell: ({ row }) => (
			<a href={row.getValue("imageUrl")} target="_blank" rel="noopener noreferrer">
				Xem Hình ảnh
			</a>
		),
	},
	{
		accessorKey: "status",
		header: "Trạng thái",
		cell: ({ row }) => {
			const status = row.getValue("status") as string;
			const getStatusColor = (status: string) => {
				switch (status.toLowerCase()) {
					case "draft":
						return "bg-yellow-100 text-yellow-700";
					case "published":
						return "bg-green-100 text-green-700";
					case "archived":
						return "bg-gray-100 text-gray-700";
					default:
						return "bg-gray-100 text-gray-700";
				}
			};
			return (
				<Badge className={getStatusColor(status)}>
					{status === "draft"
						? "Nháp"
						: status === "published"
						? "Đã xuất bản"
						: status === "archived"
						? "Lưu trữ"
						: status}
				</Badge>
			);
		},
	},
	{
		id: "actions",
		header: "Hành động",
		cell: ({ row }) => <BlogActions blog={row.original} />,
	},
];

interface BlogActionsProps {
	blog: Blog;
}

function BlogActions({ blog }: BlogActionsProps) {
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);
	const [showViewDialog, setShowViewDialog] = useState(false);
	const deleteMutation = useDeleteBlog();

	const handleDelete = async () => {
		try {
			await deleteMutation.mutateAsync(blog.id);
			toast.success("Xóa bài blog thành công");
		} catch (error) {
			toast.error("Xóa bài blog thất bại");
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
			<ViewBlogDetail open={showViewDialog} onOpenChange={setShowViewDialog} blogId={blog.id} />
			<EditBlogDialog open={showEditDialog} onOpenChange={setShowEditDialog} blog={blog} />
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Bạn có chắc chắn?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn bài blog "{blog.title}".
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

export default function BlogList() {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [statusFilter, setStatusFilter] = useState<string>("published");
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

	const { data, isLoading, error } = useGetBlogs({
		search: debouncedSearch,
		status: statusFilter,
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
				<h1 className="text-2xl font-bold">Quản lý bài blog</h1>
				<Button onClick={() => setShowCreateDialog(true)}>
					<PlusIcon className="h-4 w-4 mr-2" />
					Tạo bài blog mới
				</Button>
			</div>
			<div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
				<div className="flex-1">
					<Input
						placeholder="Tìm kiếm theo tiêu đề hoặc tóm tắt..."
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
							<SelectItem value="published">Đã xuất bản</SelectItem>
							<SelectItem value="draft">Nháp</SelectItem>
							<SelectItem value="archived">Lưu trữ</SelectItem>
						</SelectContent>
					</Select>
					{(searchQuery || statusFilter !== "published") && (
						<Button
							variant="outline"
							onClick={() => {
								setSearchQuery("");
								setStatusFilter("published");
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
									{searchQuery || statusFilter !== "published"
										? "Không tìm thấy bài blog nào với bộ lọc hiện tại."
										: "Không tìm thấy bài blog nào."}
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
							Hiển thị {data.data.meta.total} bài blog • Trang{" "}
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
			<CreateBlogDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
		</div>
	);
}