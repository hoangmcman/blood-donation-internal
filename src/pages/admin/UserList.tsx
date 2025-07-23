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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

// Mock data for blood donors
interface Donor {
  id: string
  name: string
  bloodType: string
  lastDonation: string
}

const mockDonors: Donor[] = [
  { id: "1", name: "Nguyễn Văn An", bloodType: "O+", lastDonation: "2025-06-15" },
  { id: "2", name: "Trần Thị Bình", bloodType: "A+", lastDonation: "2025-05-20" },
  { id: "3", name: "Lê Minh Châu", bloodType: "B+", lastDonation: "2025-04-10" },
  { id: "4", name: "Phạm Quốc Dũng", bloodType: "AB-", lastDonation: "2025-03-25" },
  { id: "5", name: "Hoàng Thị Mai", bloodType: "O-", lastDonation: "2025-07-01" },
  { id: "6", name: "Vũ Văn Nam", bloodType: "A-", lastDonation: "2025-02-14" },
  { id: "7", name: "Đỗ Thị Lan", bloodType: "B-", lastDonation: "2025-01-30" },
  { id: "8", name: "Ngô Quốc Hùng", bloodType: "AB+", lastDonation: "2025-06-05" },
  { id: "9", name: "Bùi Thị Hoa", bloodType: "O+", lastDonation: "2025-05-12" },
  { id: "10", name: "Lý Văn Tâm", bloodType: "A+", lastDonation: "2025-04-22" },
]

const columns: ColumnDef<Donor, any>[] = [
  {
    accessorKey: "name",
    header: "Tên người hiến",
  },
  {
    accessorKey: "bloodType",
    header: "Nhóm máu",
  },
  {
    accessorKey: "lastDonation",
    header: "Lần hiến cuối",
  },
]

export default function UserList() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 5,
  })

  const table = useReactTable({
    data: mockDonors,
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
    manualPagination: false,
  })

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Danh sách người hiến máu</h1>
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
                  Không tìm thấy người hiến máu nào.
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
    </div>
  )
}