"use client"

import { useEffect, useState } from "react"
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
  MoreHorizontal,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";

import {
  useGetEmergencyRequests,
} from "../../services/emergencyrequest"
import type { EmergencyRequest } from "../../services/emergencyrequest"
import { ViewEmergencyRequestDetail } from "@/components/dialog/ViewEmergencyRequestDetail"
import { ApproveEmergencyRequestDialog } from "@/components/dialog/ApproveEmergencyRequestDialog"
import { RejectEmergencyRequestDialog } from "@/components/dialog/RejectEmergencyRequestDialog"
import { RejectAllEmergencyRequestsDialog } from "@/components/dialog/RejectAllEmergencyRequestsDialog"

export default function EmergencyRequestList() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [approveRequestId, setApproveRequestId] = useState<string | null>(null)
  const [rejectRequestId, setRejectRequestId] = useState<string | null>(null)
  const [rejectAllOpen, setRejectAllOpen] = useState<boolean>(false)
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset pagination when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [statusFilter, debouncedSearch])

  const { data, isLoading, error } = useGetEmergencyRequests({
    search: debouncedSearch,
    status: statusFilter,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  })

  const bloodGroups = [...new Set(data?.data.data.map((request) => request.bloodType.group) || [])]
  const bloodRhs = [...new Set(data?.data.data.map((request) => request.bloodType.rh) || [])]
  const bloodTypeComponents = [...new Set(data?.data.data.map((request) => request.bloodTypeComponent) || [])]

  const columns: ColumnDef<EmergencyRequest, any>[] = [
    {
      accessorFn: (row) => row.requestedBy.email,
      id: "requestedBy",
      header: "Yêu cầu bởi",
      cell: ({ row }) => row.original.requestedBy.email,
    } as ColumnDef<EmergencyRequest, string>,
    {
      accessorFn: (row) => row.id,
      id: "requestId",
      header: "Mã yêu cầu",
      cell: ({ row }) => row.original.id,
    } as ColumnDef<EmergencyRequest, string>,
    {
      accessorFn: (row) => row.bloodType.group,
      id: "bloodGroup",
      header: "Nhóm máu",
      cell: ({ row }) => row.original.bloodType.group,
    } as ColumnDef<EmergencyRequest, string>,
    {
      accessorFn: (row) => row.bloodType.rh,
      id: "bloodRh",
      header: "Rh",
      cell: ({ row }) => row.original.bloodType.rh,
    } as ColumnDef<EmergencyRequest, string>,
    {
      accessorFn: (row) => row.status,
      id: "requestStatus",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.original.status
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
    } as ColumnDef<EmergencyRequest, string>,

    {
      accessorKey: "description",
      header: "Ghi chú",
      cell: ({ row }) => row.original.description || "Không có",
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => {
        const requestId = row.original.id

        const handleShowDetail = () => {
          setSelectedRequestId(requestId)
        }

        const handleApprove = () => {
          setApproveRequestId(requestId)
        }

        const handleReject = () => {
          setRejectRequestId(requestId)
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
                Xem lượng máu cần thiết
              </DropdownMenuItem>
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
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setRejectAllOpen(true)}
            disabled={!(data?.data.data.some((request) => request.status.toLowerCase() === "pending"))}
          >
            Từ chối tất cả
          </Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm theo mã yêu cầu hoặc email..."
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
              <SelectItem value="pending">Đang chờ</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="rejected">Đã từ chối</SelectItem>
            </SelectContent>
          </Select>
          {(searchQuery || statusFilter !== "pending") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("pending")
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
                  {searchQuery || statusFilter !== "pending"
                    ? "Không tìm thấy yêu cầu khẩn cấp nào với bộ lọc hiện tại."
                    : "Không tìm thấy yêu cầu khẩn cấp."}
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
              Hiển thị {data.data.meta.total} yêu cầu • Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
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
      <ViewEmergencyRequestDetail
        open={!!selectedRequestId}
        onOpenChange={(open) => setSelectedRequestId(open ? selectedRequestId : null)}
        requestId={selectedRequestId || ""}
      />
      <ApproveEmergencyRequestDialog
        open={!!approveRequestId}
        onOpenChange={(open) => setApproveRequestId(open ? approveRequestId : null)}
        requestId={approveRequestId || ""}
      />
      <RejectEmergencyRequestDialog
        open={!!rejectRequestId}
        onOpenChange={(open) => setRejectRequestId(open ? rejectRequestId : null)}
        requestId={rejectRequestId || ""}
      />
      <RejectAllEmergencyRequestsDialog
        open={rejectAllOpen}
        onOpenChange={setRejectAllOpen}
        bloodGroups={bloodGroups}
        bloodRhs={bloodRhs}
        bloodTypeComponents={bloodTypeComponents}
      />
    </div>
  )
}