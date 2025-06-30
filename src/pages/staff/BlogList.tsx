"use client"

import * as React from "react"
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  MoreVerticalIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
} from "lucide-react"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  useGetBlogs,
  useDeleteBlog,
  type Blog,
} from "../../services/blog"
import { CreateBlogDialog } from "@/components/dialog/CreateBlogDialog"
import { EditBlogDialog } from "@/components/dialog/EditBlogDialog"
import { ViewBlogDetail } from "@/components/dialog/ViewBlogDetail"

const columns: ColumnDef<Blog, any>[] = [
  {
    accessorKey: "title",
    header: "Tiêu đề",
  },
  {
    accessorKey: "excerpt",
    header: "Tóm tắt",
  },
  {
    accessorKey: "publishedAt",
    header: "Ngày xuất bản",
    cell: ({ row }) => new Date(row.getValue("publishedAt")).toLocaleDateString('vi-VN'),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
          case "draft":
            return "bg-yellow-100 text-yellow-700"
          case "published":
            return "bg-green-100 text-green-700"
          case "archived":
            return "bg-gray-100 text-gray-700"
          default:
            return "bg-gray-100 text-gray-700"
        }
      }
      return (
        <Badge className={getStatusColor(status)}>
          {status === "draft" ? "Nháp" :
           status === "published" ? "Đã xuất bản" :
           status === "archived" ? "Lưu trữ" : status}
        </Badge>
      )
    },
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
    id: "actions",
    header: "Hành động",
    cell: ({ row }) => <BlogActions blog={row.original} />,
  },
]

interface BlogActionsProps {
  blog: Blog
}

function BlogActions({ blog }: BlogActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [showViewDialog, setShowViewDialog] = React.useState(false)
  const deleteMutation = useDeleteBlog()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(blog.id)
      toast.success("Xóa bài blog thành công")
    } catch (error) {
      toast.error("Xóa bài blog thất bại")
    } finally {
      setShowDeleteDialog(false)
    }
  }

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
      <ViewBlogDetail
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        blogId={blog.id}
      />
      <EditBlogDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        blog={blog}
      />
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
  )
}

export default function BlogList() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)

  const { data, isLoading, error } = useGetBlogs(
    Number(pagination.pageIndex) + 1,
    Number(pagination.pageSize)
  )

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
  })

  if (isLoading) {
    return <div>Đang tải...</div>
  }

  if (error) {
    return <div>Lỗi: {error.message}</div>
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
                  Không tìm thấy bài blog nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Trang {table.getState().pagination.pageIndex + 1} /{' '}
          {table.getPageCount()}
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
      <CreateBlogDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
      <Toaster />
    </div>
  )
}