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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import {
  useGetEmergencyRequestLogs,
} from "../../services/emergencyrequest"
import type { EmergencyRequestLog } from "../../services/emergencyrequest"
import { ViewEmergencyRequestDetail } from "@/components/dialog/ViewEmergencyRequestDetail"

export default function EmergencyRequestList() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [selectedLogId, setSelectedLogId] = React.useState<string | null>(null)

  const columns: ColumnDef<EmergencyRequestLog, any>[] = [
    {
      accessorFn: (row) => row.emergencyRequest.id,
      id: "requestId",
      header: "Mã yêu cầu",
      cell: ({ row }) => row.original.emergencyRequest.id,
    } as ColumnDef<EmergencyRequestLog, string>,
    {
      accessorFn: (row) => row.emergencyRequest.bloodType.group,
      id: "bloodGroup",
      header: "Nhóm máu",
      cell: ({ row }) => row.original.emergencyRequest.bloodType.group,
    } as ColumnDef<EmergencyRequestLog, string>,
    {
      accessorFn: (row) => row.emergencyRequest.bloodType.rh,
      id: "bloodRh",
      header: "Rh",
      cell: ({ row }) => row.original.emergencyRequest.bloodType.rh,
    } as ColumnDef<EmergencyRequestLog, string>,
    {
      accessorFn: (row) => row.emergencyRequest.status,
      id: "requestStatus",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.original.emergencyRequest.status
        const getStatusColor = (status: string) => {
          switch (status.toLowerCase()) {
            case "approved": return "bg-green-100 text-green-700"
            case "rejected": return "bg-red-100 text-red-700"
            case "pending": return "bg-yellow-100 text-yellow-700"
            default: return "bg-gray-100 text-gray-700"
          }
        }
        return (
          <Badge className={getStatusColor(status)}>
            {status === "approved" ? "Đã duyệt" :
              status === "rejected" ? "Đã từ chối" :
                status === "pending" ? "Đang chờ" : status}
          </Badge>
        )
      },
    } as ColumnDef<EmergencyRequestLog, string>,
    {
      accessorFn: (row) => row.emergencyRequest.requestedBy,
      id: "requestedBy",
      header: "Yêu cầu bởi",
      cell: ({ row }) => row.original.emergencyRequest.requestedBy,
    } as ColumnDef<EmergencyRequestLog, string>,
    {
      accessorKey: "note", // Không lồng nên giữ nguyên accessorKey
      header: "Ghi chú",
      cell: ({ row }) => row.original.note,
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => {
        const requestId = row.original.emergencyRequest.id
        const logId = row.original.id

        const handleShowDetail = () => {
          setSelectedLogId(logId)
        }

        const handleApprove = () => {
          console.log("Approve request:", requestId)
          // Implement approve mutation here using useApproveEmergencyRequest
        }

        const handleReject = () => {
          console.log("Reject request:", requestId)
          // Implement reject mutation here using useRejectEmergencyRequest
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShowDetail}>
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleApprove}>
                Duyệt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReject}>
                Từ chối
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const { data, isLoading, error } = useGetEmergencyRequestLogs(
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
        <h1 className="text-2xl font-bold">Danh sách yêu cầu khẩn cấp</h1>
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
                  Không tìm thấy yêu cầu khẩn cấp.
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
      <ViewEmergencyRequestDetail
        open={!!selectedLogId}
        onOpenChange={(open) => setSelectedLogId(open ? selectedLogId : null)}
        logId={selectedLogId || ""}
      />
    </div>
  )
}