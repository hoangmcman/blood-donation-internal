"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useGetEmergencyRequestById } from "../../services/emergencyrequest"

interface EmergencyRequest {
  id: string
  createdAt: string
  updatedAt: string
  requestedBy: {
    id: string;
    createdAt: string;
    updatedAt: string;
    email: string;
    role: string;
  };
  bloodUnit: string | null
  usedVolume: number
  requiredVolume: number
  bloodType: { group: string; rh: string }
  bloodTypeComponent: string
  status: string
  rejectionReason: string | null
  startDate: string
  endDate: string
  wardCode: string
  districtCode: string
  provinceCode: string
  wardName: string
  districtName: string
  provinceName: string
  longitude: string
  latitude: string
}

interface ViewEmergencyRequestDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string // Thay logId bằng requestId
}

export function ViewEmergencyRequestDetail({ open, onOpenChange, requestId }: ViewEmergencyRequestDetailProps) {
  const { data, isLoading, error } = useGetEmergencyRequestById(requestId)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu khẩn cấp</DialogTitle>
          </DialogHeader>
          <div>Loading...</div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !data?.success || !data?.data) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu khẩn cấp</DialogTitle>
          </DialogHeader>
          <div>Error: {error?.message || "Failed to load request details"}</div>
        </DialogContent>
      </Dialog>
    )
  }

  const request = data.data as EmergencyRequest

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Chi tiết yêu cầu khẩn cấp</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Mã yêu cầu</label>
              <p className="text-sm text-gray-900">{request.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Nhóm máu</label>
              <p className="text-sm text-gray-900">{request.bloodType.group}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Rh</label>
              <p className="text-sm text-gray-900">{request.bloodType.rh}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Thành phần máu</label>
              <p className="text-sm text-gray-900">{request.bloodTypeComponent}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <p className="text-sm text-gray-900">
                <Badge className={getStatusColor(request.status)}>
                  {request.status === "approved" ? "Đã duyệt" :
                    request.status === "rejected" ? "Đã từ chối" :
                    request.status === "pending" ? "Đang chờ" : request.status}
                </Badge>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày tạo</label>
              <p className="text-sm text-gray-900">{new Date(request.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày cập nhật</label>
              <p className="text-sm text-gray-900">{new Date(request.updatedAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Yêu cầu bởi</label>
              <p className="text-sm text-gray-900">{request.requestedBy.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Dung tích yêu cầu</label>
              <p className="text-sm text-gray-900">{request.requiredVolume} ml</p>
            </div>
            <div>
              <label className="text-sm font-medium">Dung tích sử dụng</label>
              <p className="text-sm text-gray-900">{request.usedVolume} ml</p>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày bắt đầu</label>
              <p className="text-sm text-gray-900">{new Date(request.startDate).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày kết thúc</label>
              <p className="text-sm text-gray-900">{new Date(request.endDate).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Lý do từ chối</label>
              <p className="text-sm text-gray-900">{request.rejectionReason || "N/A"}</p>
            </div>
            {/* <div>
              <label className="text-sm font-medium">Ghi chú</label>
              <p className="text-sm text-gray-900">{request.description || "Không có"}</p>
            </div> */}
            <div>
              <label className="text-sm font-medium">Nhân viên xử lý</label>
              <p className="text-sm text-gray-900">N/A</p> {/* Không có staff trong EmergencyRequest */}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}