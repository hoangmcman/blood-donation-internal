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
import { useGetBloodUnitActions } from "../../services/inventory"
import type { BloodUnitAction } from "../../services/inventory"
import { ViewBloodUnitActionDialog } from "@/components/dialog/ViewBloodUnitActionDialog"

export default function BloodUnitHistory() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [dialogActionId, setDialogActionId] = React.useState<string | null>(null)

  const columns: ColumnDef<BloodUnitAction, any>[] = [
    {
      id: "staffName",
      header: "Tên nhân viên",
      accessorFn: row => `${row.staff.firstName} ${row.staff.lastName}`,
      cell: ({ getValue }) => getValue(),
    },
    {
      id: "description",
      header: "Mô tả",
      accessorFn: row => row.description,
      cell: ({ getValue }) => getValue(),
    },
    {
      id: "bloodGroup",
      header: "Nhóm máu",
      accessorFn: row => row.bloodUnit.bloodType.group,
      cell: ({ getValue }) => getValue(),
    },
    {
      id: "bloodRh",
      header: "Rh máu",
      accessorFn: row => row.bloodUnit.bloodType.rh,
      cell: ({ getValue }) => getValue(),
    },
    {
      id: "remainingVolume",
      header: "Dung tích còn lại",
      accessorFn: row => row.bloodUnit.remainingVolume,
      cell: ({ getValue }) => getValue(),
    },
    {
      id: "action",
      header: "Hành động",
      accessorFn: row => row.action,
      cell: ({ getValue }) => {
        const action = getValue() as string
        const getActionColor = (action: string) => {
          switch (action) {
            case "status_update":
              return "bg-blue-100 text-blue-700"
            case "volume_change":
              return "bg-purple-100 text-purple-700"
            default:
              return "bg-gray-100 text-gray-700"
          }
        }
        return (
          <Badge className={getActionColor(action)}>
            {action === "status_update" ? "Cập nhật trạng thái" :
             action === "volume_change" ? "Thay đổi dung tích" : action}
          </Badge>
        )
      },
    },
    {
      id: "createdAt",
      header: "Ngày tạo",
      accessorFn: row => row.createdAt,
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString('vi-VN'),
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => setDialogActionId(row.original.id)}>
          Xem chi tiết
        </Button>
      ),
    },
  ]

  const { data, isLoading, error } = useGetBloodUnitActions(
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
        <h1 className="text-2xl font-bold">Lịch sử đơn vị máu</h1>
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
                  Không tìm thấy lịch sử.
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
      {dialogActionId && (
        <ViewBloodUnitActionDialog
          open={!!dialogActionId}
          onOpenChange={(open) => setDialogActionId(open ? dialogActionId : null)}
          actionId={dialogActionId}
        />
      )}
    </div>
  )
}