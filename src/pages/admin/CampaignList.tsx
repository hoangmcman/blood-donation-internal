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
  useGetCampaigns,
  useDeleteCampaign,
  type Campaign,
} from "../../services/campaign"
import { CreateCampaignDialog } from "../../components/dialog/CreateCampaignDialog"
import { EditCampaignDialog } from "../../components/dialog/EditCampaignDialog"
import { ViewCampaignDetail } from "../../components/dialog/ViewCampaignDetail"

const columns: ColumnDef<Campaign, any>[] = [
  {
    accessorKey: "name",
    header: "Tên chiến dịch",
  },
  {
    accessorKey: "description",
    header: "Mô tả",
  },
  {
    accessorKey: "startDate",
    header: "Ngày bắt đầu",
    cell: ({ row }) => new Date(row.getValue("startDate")).toLocaleDateString('vi-VN'),
  },
  {
    accessorKey: "endDate",
    header: "Ngày kết thúc",
    cell: ({ row }) => row.getValue("endDate") ? new Date(row.getValue("endDate")).toLocaleDateString('vi-VN') : "Không có",
  },
  {
    accessorKey: "bloodCollectionDate",
    header: "Ngày thu thập máu",
    cell: ({ row }) => row.getValue("bloodCollectionDate") ? new Date(row.getValue("bloodCollectionDate")).toLocaleDateString('vi-VN') : "Không có",
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string

      const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
          case "active":
            return "bg-green-100 text-green-700"
          case "inactive":
            return "bg-yellow-100 text-yellow-700"
          case "completed":
            return "bg-blue-100 text-blue-700"
          case "cancelled":
            return "bg-red-100 text-red-700"
          default:
            return "bg-gray-100 text-gray-700"
        }
      }

      return (
        <Badge className={getStatusColor(status)}>
          {status === "active" ? "Hoạt động" :
           status === "inactive" ? "Không hoạt động" :
           status === "completed" ? "Hoàn thành" :
           status === "cancelled" ? "Đã hủy" : status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "banner",
    header: "Banner",
    cell: ({ row }) => (
      <a href={row.getValue("banner")} target="_blank" rel="noopener noreferrer">
        Xem Banner
      </a>
    ),
  },
  {
    accessorKey: "location",
    header: "Địa điểm",
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
]

interface CampaignActionsProps {
  campaign: Campaign
}

function CampaignActions({ campaign }: CampaignActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [showViewDialog, setShowViewDialog] = React.useState(false)
  const deleteMutation = useDeleteCampaign()

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(campaign.id)
      toast.success("Xóa chiến dịch thành công")
    } catch (error) {
      toast.error("Xóa chiến dịch thất bại")
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
              Hành động này không thể hoàn tác. Điều này sẽ xóa vĩnh viễn chiến dịch "{campaign.name}".
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

export default function CampaignList() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)

  const { data, isLoading, error } = useGetCampaigns(
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
        <h1 className="text-2xl font-bold">Quản lý chiến dịch</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Tạo chiến dịch mới
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
                  Không tìm thấy chiến dịch nào.
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
      <CreateCampaignDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
      <Toaster />
    </div>
  )
}