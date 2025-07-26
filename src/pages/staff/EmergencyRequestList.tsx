"use client";

import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
	Contact,
	MoreHorizontal,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ApproveEmergencyRequestDialog } from "@/components/dialog/ApproveEmergencyRequestDialog";
import { ProvideContactsDialog } from "@/components/dialog/ProvideContactsDialog";
import { RejectAllEmergencyRequestsDialog } from "@/components/dialog/RejectAllEmergencyRequestsDialog";
import { RejectEmergencyRequestDialog } from "@/components/dialog/RejectEmergencyRequestDialog";
import { ViewEmergencyRequestDetail } from "@/components/dialog/ViewEmergencyRequestDetail";
import { ViewRequiredBloodUnitsDialog } from "@/components/dialog/ViewRequiredBloodUnitsDialog";
import Loader from "@/components/loader";
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

import { AccountUserRole } from "@/interfaces/account";
import { BloodComponentTypeOnly, BloodGroup, BloodRh } from "@/interfaces/blood";
import { EmergencyRequest, EmergencyRequestStatus } from "@/interfaces/emergency-request";

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

import { useGetEmergencyRequests } from "@/services/emergencyrequest";

export default function EmergencyRequestList() {
	// Table & filter states
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

	const [approveRequestId, setApproveRequestId] = useState<string | null>(null);
	const [rejectRequestId, setRejectRequestId] = useState<string | null>(null);
	const [rejectAllOpen, setRejectAllOpen] = useState<boolean>(false);

	const [statusFilter, setStatusFilter] = useState<EmergencyRequestStatus>(
		EmergencyRequestStatus.PENDING
	);
	const [bloodGroupFilter, setBloodGroupFilter] = useState<BloodGroup | "">("");
	const [bloodRhFilter, setBloodRhFilter] = useState<BloodRh | "">("");
	const [bloodTypeComponentFilter, setBloodTypeComponentFilter] = useState<
		BloodComponentTypeOnly | ""
	>("");
	const [requestedByRoleFilter, setRequestedByRoleFilter] = useState<AccountUserRole>(
		AccountUserRole.User
	);

	const [searchQuery, setSearchQuery] = useState<string>("");
	const [debouncedSearch, setDebouncedSearch] = useState<string>("");

	const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
	const [bloodUnitsRequestId, setBloodUnitsRequestId] = useState<string | null>(null);
	const [showBloodUnitsDialog, setShowBloodUnitsDialog] = useState(false);
	const [provideContactsRequestId, setProvideContactsRequestId] = useState<string | null>(null);

	// ✅ Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchQuery);
		}, 500);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// ✅ Reset pagination when filters change
	useEffect(() => {
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	}, [
		statusFilter,
		debouncedSearch,
		bloodGroupFilter,
		bloodRhFilter,
		bloodTypeComponentFilter,
		requestedByRoleFilter,
	]);

	// ✅ Call API - chỉ truyền các filter BE hỗ trợ
	const { data, isLoading, error } = useGetEmergencyRequests({
		status: statusFilter,
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
		bloodGroup: bloodGroupFilter || undefined,
		bloodRh: bloodRhFilter || undefined,
		bloodTypeComponent: bloodTypeComponentFilter || undefined,
		requestedByRole: requestedByRoleFilter,
	});

	// ✅ Client-side filter theo search
	const filteredData =
		data?.data.data.filter((request) => {
			if (!debouncedSearch) return true;
			const s = debouncedSearch.toLowerCase();
			return (
				request.id.toLowerCase().includes(s) ||
				request.requestedBy.email.toLowerCase().includes(s)
			);
		}) || [];

	// Dropdown data
	const bloodGroups = [...new Set(filteredData.map((request) => request.bloodType.group))];
	const bloodRhs = [...new Set(filteredData.map((request) => request.bloodType.rh))];
	const bloodTypeComponents = [
		...new Set(filteredData.map((request) => request.bloodTypeComponent)),
	];

	// ✅ Table columns
	const columns: ColumnDef<EmergencyRequest, any>[] = [
		{
			accessorFn: (row) => row.requestedBy.email,
			id: "requestedBy",
			header: "Yêu cầu bởi",
			cell: ({ row }) => row.original.requestedBy.email,
		},
		{
			accessorFn: (row) => row.bloodType.group,
			id: "bloodGroup",
			header: "Nhóm máu",
			cell: ({ row }) => row.original.bloodType.group,
		},
		{
			accessorFn: (row) => row.bloodType.rh,
			id: "bloodRh",
			header: "Rh",
			cell: ({ row }) => row.original.bloodType.rh,
		},
		{
			accessorFn: (row) => row.bloodTypeComponent,
			id: "bloodTypeComponent",
			header: "Thành phần máu",
			cell: ({ row }) => {
				const component = row.original.bloodTypeComponent as BloodComponentTypeOnly;
				switch (component) {
					case BloodComponentTypeOnly.PLASMA:
						return "Huyết tương";
					case BloodComponentTypeOnly.PLATELETS:
						return "Tiểu cầu";
					case BloodComponentTypeOnly.RED_CELLS:
						return "Hồng cầu";
					default:
						return "Không xác định";
				}
			},
		},
		{
			accessorFn: (row) => row.status,
			id: "requestStatus",
			header: "Trạng thái",
			cell: ({ row }) => {
				const status = row.original.status;
				const getStatusColor = (status: string) => {
					switch (status.toLowerCase()) {
						case "approved":
							return "bg-green-100 text-green-700 border-green-200 hover:bg-green-50";
						case "rejected":
							return "bg-red-100 text-red-700 border-red-200 hover:bg-red-50";
						case "pending":
							return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-50";
						case "contacts_provided":
							return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-50";
						case "expired":
							return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-50";
						default:
							return "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-50";
					}
				};
				return (
					<Badge className={getStatusColor(status)}>
						{status === "approved"
							? "Đã duyệt"
							: status === "rejected"
							? "Đã từ chối"
							: status === "pending"
							? "Đang chờ"
							: status === "contacts_provided"
							? "Đã cung cấp liên hệ"
							: status === "expired"
							? "Đã hết hạn"
							: status}
					</Badge>
				);
			},
		},
		{
			accessorKey: "description",
			header: "Ghi chú",
			cell: ({ row }) => row.original.description || "Không có",
		},
		{
			id: "actions",
			header: "Hành động",
			cell: ({ row }) => {
				const requestId = row.original.id;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{row.original.requestedBy.role === AccountUserRole.User &&
								row.original.status === EmergencyRequestStatus.PENDING && (
									<DropdownMenuItem onClick={() => setProvideContactsRequestId(requestId)}>
										<Contact className="size-4" />
										<span>Cung cấp thông tin liên hệ</span>
									</DropdownMenuItem>
								)}

							{row.original.requestedBy.role === AccountUserRole.Hospital && (
								<>
									<DropdownMenuItem
										onClick={() => {
											setBloodUnitsRequestId(requestId);
											setShowBloodUnitsDialog(true);
										}}
									>
										Xem lượng máu cần thiết
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setSelectedRequestId(requestId)}>
										Xem chi tiết
									</DropdownMenuItem>
									{row.original.status === EmergencyRequestStatus.PENDING && (
										<>
											<DropdownMenuItem onClick={() => setApproveRequestId(requestId)}>
												Duyệt
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => setRejectRequestId(requestId)}>
												Từ chối
											</DropdownMenuItem>
										</>
									)}
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	// ✅ Table setup
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
		pageCount: data?.data.meta.totalPages,
	});

	if (error) {
		return <div>Lỗi: {error.message}</div>;
	}

	return (
		<div className="w-full p-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Danh sách yêu cầu khẩn cấp</h1>
				<Button
					onClick={() => setRejectAllOpen(true)}
					disabled={!data?.data.data.some((r) => r.status.toLowerCase() === "pending")}
				>
					Từ chối tất cả
				</Button>
			</div>

			{/* ✅ Filters */}
			<div className="flex flex-col gap-4 mb-4">
				<div className="flex-1">
					<Input
						placeholder="Tìm kiếm theo mã yêu cầu hoặc email..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="max-w-sm"
					/>
				</div>
				<div className="flex gap-2 flex-wrap">
					<Select
						value={statusFilter}
						onValueChange={(v) => setStatusFilter(v as EmergencyRequestStatus)}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Chọn trạng thái" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={EmergencyRequestStatus.PENDING}>Đang chờ</SelectItem>
							<SelectItem value={EmergencyRequestStatus.APPROVED}>Đã duyệt</SelectItem>
							<SelectItem value={EmergencyRequestStatus.REJECTED}>Đã từ chối</SelectItem>
							<SelectItem value={EmergencyRequestStatus.CONTACTS_PROVIDED}>
								Đã cung cấp liên hệ
							</SelectItem>
							<SelectItem value={EmergencyRequestStatus.EXPIRED}>Đã hết hạn</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={bloodGroupFilter}
						onValueChange={(v) => setBloodGroupFilter(v as BloodGroup | "")}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Nhóm máu" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={BloodGroup.A}>A</SelectItem>
							<SelectItem value={BloodGroup.B}>B</SelectItem>
							<SelectItem value={BloodGroup.AB}>AB</SelectItem>
							<SelectItem value={BloodGroup.O}>O</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={bloodRhFilter}
						onValueChange={(v) => setBloodRhFilter(v as BloodRh | "")}
					>
						<SelectTrigger className="w-[100px]">
							<SelectValue placeholder="Rh" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={BloodRh.POSITIVE}>+</SelectItem>
							<SelectItem value={BloodRh.NEGATIVE}>-</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={bloodTypeComponentFilter}
						onValueChange={(v) => setBloodTypeComponentFilter(v as BloodComponentTypeOnly | "")}
					>
						<SelectTrigger className="w-[160px]">
							<SelectValue placeholder="Thành phần máu" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={BloodComponentTypeOnly.PLASMA}>Huyết tương</SelectItem>
							<SelectItem value={BloodComponentTypeOnly.PLATELETS}>Tiểu cầu</SelectItem>
							<SelectItem value={BloodComponentTypeOnly.RED_CELLS}>Hồng cầu</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={requestedByRoleFilter}
						onValueChange={(v) => setRequestedByRoleFilter(v as AccountUserRole)}
					>
						<SelectTrigger className="w-[150px]">
							<SelectValue placeholder="Người yêu cầu" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={AccountUserRole.User}>Người dùng</SelectItem>
							<SelectItem value={AccountUserRole.Hospital}>Bệnh viện</SelectItem>
						</SelectContent>
					</Select>

					{(searchQuery ||
						statusFilter !== EmergencyRequestStatus.PENDING ||
						bloodGroupFilter ||
						bloodRhFilter ||
						bloodTypeComponentFilter ||
						requestedByRoleFilter !== AccountUserRole.User) && (
						<Button
							variant="outline"
							onClick={() => {
								setSearchQuery("");
								setStatusFilter(EmergencyRequestStatus.PENDING);
								setBloodGroupFilter("");
								setBloodRhFilter("");
								setBloodTypeComponentFilter("");
								setRequestedByRoleFilter(AccountUserRole.User);
							}}
						>
							Xóa bộ lọc
						</Button>
					)}
				</div>
			</div>

			{/* ✅ Table */}
			{isLoading ? (
				<div className="flex items-center justify-center">
					<Loader />
				</div>
			) : (
				<>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								{table.getHeaderGroups().map((hg) => (
									<TableRow key={hg.id}>
										{hg.headers.map((h) => (
											<TableHead key={h.id}>
												{h.isPlaceholder
													? null
													: flexRender(h.column.columnDef.header, h.getContext())}
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
							{data?.data.meta && (
								<span>
									Hiển thị {data.data.meta.total} yêu cầu • Trang{" "}
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

			{/* ✅ Dialogs */}
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
			<ViewRequiredBloodUnitsDialog
				open={showBloodUnitsDialog}
				onOpenChange={(open) => {
					setShowBloodUnitsDialog(open);
					if (!open) setBloodUnitsRequestId(null);
				}}
				requestId={bloodUnitsRequestId || ""}
			/>
			<ProvideContactsDialog
				open={!!provideContactsRequestId}
				onOpenChange={(open) => {
					setProvideContactsRequestId(open ? provideContactsRequestId : null);
				}}
				requestId={provideContactsRequestId!}
			/>
		</div>
	);
}
