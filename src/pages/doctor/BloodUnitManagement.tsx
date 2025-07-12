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
} from "lucide-react"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useGetBloodUnits } from "../../services/inventory"
import UpdateBloodUnitDialog from "@/components/dialog/UpdateBloodUnitDialog"

interface BloodUnit {
  id: string
  createdAt: string
  updatedAt: string
  member: {
    firstName: string
    lastName: string
    bloodType: { group: string; rh: string } | null
  }
  bloodType: { group: string; rh: string }
  bloodVolume: number
  remainingVolume: number
  expiredDate: string
  status: string
}

export default function BloodUnitList() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [isDialogOpen, setIsDialogOpen] = React.useState<string | null>(null)

  const columns: ColumnDef<BloodUnit>[] = [
    {
      accessorKey: "member.firstName",
      header: "Tên thành viên",
      cell: ({ row }) => row.original.member.firstName,
    },
    {
      accessorKey: "member.lastName",
      header: "Họ thành viên",
      cell: ({ row }) => row.original.member.lastName,
    },
    {
      accessorKey: "bloodType.group",
      header: "Nhóm máu",
      cell: ({ row }) => row.original.bloodType.group,
    },
    {
      accessorKey: "bloodType.rh",
      header: "Rh máu",
      cell: ({ row }) => row.original.bloodType.rh,
    },
    {
      accessorKey: "bloodVolume",
      header: "Dung tích máu",
    },
    {
      accessorKey: "remainingVolume",
      header: "Dung tích còn lại",
    },
    {
      accessorKey: "expiredDate",
      header: "Ngày hết hạn",
      cell: ({ row }) => new Date(row.getValue("expiredDate")).toLocaleDateString('vi-VN'),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const getStatusColor = (status: string) => {
          switch (status.toLowerCase()) {
            case "available":
              return "bg-green-100 text-green-700"
            case "used":
              return "bg-yellow-100 text-yellow-700"
            case "expired":
              return "bg-red-100 text-red-700"
            case "damaged":
              return "bg-gray-100 text-gray-700"
            default:
              return "bg-gray-100 text-gray-700"
          }
        }
        return (
          <Badge className={getStatusColor(status)}>
            {status === "available" ? "Có sẵn" :
             status === "used" ? "Đã sử dụng" :
             status === "expired" ? "Hết hạn" :
             status === "damaged" ? "Hư hỏng" : status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(row.original.id)}
        >
          Cập nhật
        </Button>
      ),
    },
  ]

  const { data, isLoading, error } = useGetBloodUnits(
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
        <h1 className="text-2xl font-bold">Danh sách đơn vị máu</h1>
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
                  Không tìm thấy đơn vị máu.
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
      <Toaster />
      {isDialogOpen && (
        <UpdateBloodUnitDialog
          open={!!isDialogOpen}
          onOpenChange={(open) => setIsDialogOpen(open ? isDialogOpen : null)}
          bloodUnitId={isDialogOpen}
        />
      )}
    </div>
  )
}