"use client"

import * as React from "react"
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  MoreVerticalIcon,
} from "lucide-react"
import { useParams } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
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
  useGetDonationRequests,
} from "../../services/campaign"
import CreateBloodUnitDialog from "@/components/dialog/CreateBloodUnitDialog"

interface DonationRequest {
  id: string
  donor: {
    id: string
    firstName: string
    lastName: string
  }
  campaign: {
    id: string
    name: string
  }
  amount: number
  note: string
  appointmentDate: string
  currentStatus: "pending" | "completed" | "failed"
  createdAt: string
  updatedAt: string
}

interface DonationRequestActionsProps {
  donationRequest: DonationRequest
  onOpenDialog: (memberId: string, memberName: string) => void
}

function DonationRequestActions({ donationRequest, onOpenDialog }: DonationRequestActionsProps) {
  const memberId = donationRequest.donor.id
  const memberName = `${donationRequest.donor.firstName} ${donationRequest.donor.lastName}`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVerticalIcon className="h-4 w-4" />
          <span className="sr-only">Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onOpenDialog(memberId, memberName)}>
          Tạo đơn vị máu
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function DonationRequestList() {
  const { id } = useParams<{ id: string }>()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedMember, setSelectedMember] = React.useState<{ id: string; name: string }>({
    id: "",
    name: "",
  })

  const columns: ColumnDef<DonationRequest>[] = [
    {
      accessorKey: "donor.firstName",
      header: "Tên người hiến",
      cell: ({ row }: { row: any }) => row.original.donor.firstName,
    },
    {
      accessorKey: "donor.lastName",
      header: "Họ người hiến",
      cell: ({ row }: { row: any }) => row.original.donor.lastName,
    },
    {
      accessorKey: "amount",
      header: "Số lượng",
    },
    {
      accessorKey: "note",
      header: "Ghi chú",
    },
    {
      accessorKey: "appointmentDate",
      header: "Ngày hẹn",
      cell: ({ row }: { row: any }) => new Date(row.getValue("appointmentDate")).toLocaleDateString('vi-VN'),
    },
    {
      accessorKey: "currentStatus",
      header: "Trạng thái",
      cell: ({ row }: { row: any }) => {
        const status = row.getValue("currentStatus") as string
        const getStatusColor = (status: string) => {
          switch (status.toLowerCase()) {
            case "pending":
              return "bg-yellow-100 text-yellow-700"
            case "completed":
              return "bg-green-100 text-green-700"
            case "failed":
              return "bg-red-100 text-red-700"
            default:
              return "bg-gray-100 text-gray-700"
          }
        }
        return (
          <Badge className={getStatusColor(status)}>
            {status === "pending" ? "Đang chờ" :
             status === "completed" ? "Hoàn thành" :
             status === "failed" ? "Thất bại" : status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }: { row: any }) => new Date(row.getValue("createdAt")).toLocaleDateString('vi-VN'),
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }: { row: any }) => (
        <DonationRequestActions
          donationRequest={row.original}
          onOpenDialog={(memberId, memberName) => {
            setIsDialogOpen(true)
            setSelectedMember({ id: memberId, name: memberName })
          }}
        />
      ),
    },
  ]

  const { data, isLoading, error } = useGetDonationRequests(
    id || "",
    undefined,
    Number(pagination.pageSize),
    Number(pagination.pageIndex) + 1
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
        <h1 className="text-2xl font-bold">Yêu cầu hiến máu cho chiến dịch</h1>
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
                  Không tìm thấy yêu cầu hiến máu nào.
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
      <CreateBloodUnitDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        memberId={selectedMember.id}
        memberName={selectedMember.name}
      />
    </div>
  )
}