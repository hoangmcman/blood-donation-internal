"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { useGetCustomerList } from "../../services/dashboard"; // Giả sử đường dẫn đúng
import { Customer } from "../../services/dashboard"; // Import interface Customer

// Định nghĩa cột cho bảng
const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "firstName",
    header: "Họ",
  },
  {
    accessorKey: "lastName",
    header: "Tên",
  },
  {
    accessorFn: (row) => `${row.bloodType?.group || "N/A"}${row.bloodType?.rh || ""}`,
    id: "bloodType",
    header: "Nhóm máu",
  },
  {
    accessorKey: "dateOfBirth",
    header: "Ngày sinh",
    cell: ({ row }) =>
      new Date(row.getValue("dateOfBirth")).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
  },
  {
    accessorKey: "phone",
    header: "Số điện thoại",
  },
  {
    accessorKey: "lastDonationDate",
    header: "Ngày hiến máu cuối",
    cell: ({ row }) =>
      row.getValue("lastDonationDate")
        ? new Date(row.getValue("lastDonationDate")).toLocaleDateString("vi-VN")
        : "Chưa hiến máu",
  }
];

export default function UserList() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination khi search thay đổi
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch]);

  // Gọi API useGetCustomerList
  const { data, isLoading, error } = useGetCustomerList(
    pagination.pageIndex + 1,
    pagination.pageSize
  );

  // Lọc dữ liệu theo searchQuery
  const filteredData = data?.data.customers.filter((customer) =>
    `${customer.firstName} ${customer.lastName}`
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase())
  ) || [];

  const table = useReactTable({
    data: filteredData,
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
    pageCount: Math.ceil((data?.data.total || 0) / pagination.pageSize),
  });

  if (error) {
    return <div>Lỗi: {error.message}</div>;
  }

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Danh sách người dùng</h1>
      </div>

      {/* Search Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm theo tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {searchQuery && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
            }}
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center">
          <Loader />
        </div>
      )}

      {!isLoading && (
        <>
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
                      {searchQuery
                        ? `Không tìm thấy người dùng nào với tên "${searchQuery}".`
                        : "Không tìm thấy người dùng nào."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {data?.data.total && (
                <span>
                  Hiển thị {filteredData.length} / {data.data.total} người dùng • Trang{" "}
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
        </>
      )}
    </div>
  );
}