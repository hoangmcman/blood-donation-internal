"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useGetEmergencyRequestLogById } from "../../services/emergencyrequest"

interface EmergencyRequest {
  id: string
  createdAt: string
  updatedAt: string
  requestedBy: string
  bloodUnit: string | null
  usedVolume: number
  requiredVolume: number
  bloodType: { group: string; rh: string }
  bloodTypeComponent: string
  status: string
  rejectionReason: string | null
  startDate: string
  endDate: string
}

interface EmergencyRequestLog {
  id: string
  createdAt: string
  updatedAt: string
  emergencyRequest: EmergencyRequest
  staff: { firstName: string; lastName: string; role: string } | null
  account: { email: string; role: string } | null
  status: string
  note: string
  previousValue: string
  newValue: string
}

interface ViewEmergencyRequestDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  logId: string
}

export function ViewEmergencyRequestDetail({ open, onOpenChange, logId }: ViewEmergencyRequestDetailProps) {
  const { data, isLoading, error } = useGetEmergencyRequestLogById(logId)

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

  const log = data.data as EmergencyRequestLog

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
              <p className="text-sm text-gray-900">{log.emergencyRequest.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Nhóm máu</label>
              <p className="text-sm text-gray-900">{log.emergencyRequest.bloodType.group}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Rh</label>
              <p className="text-sm text-gray-900">{log.emergencyRequest.bloodType.rh}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Thành phần máu</label>
              <p className="text-sm text-gray-900">{log.emergencyRequest.bloodTypeComponent}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <p className="text-sm text-gray-900">
                <Badge className={getStatusColor(log.emergencyRequest.status)}>
                  {log.emergencyRequest.status === "approved" ? "Đã duyệt" :
                    log.emergencyRequest.status === "rejected" ? "Đã từ chối" :
                    log.emergencyRequest.status === "pending" ? "Đang chờ" : log.emergencyRequest.status}
                </Badge>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày tạo</label>
              <p className="text-sm text-gray-900">{new Date(log.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày cập nhật</label>
              <p className="text-sm text-gray-900">{new Date(log.updatedAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Yêu cầu bởi</label>
              <p className="text-sm text-gray-900">{log.emergencyRequest.requestedBy}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Dung tích yêu cầu</label>
              <p className="text-sm text-gray-900">{log.emergencyRequest.requiredVolume} ml</p>
            </div>
            <div>
              <label className="text-sm font-medium">Dung tích sử dụng</label>
              <p className="text-sm text-gray-900">{log.emergencyRequest.usedVolume} ml</p>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày bắt đầu</label>
              <p className="text-sm text-gray-900">{new Date(log.emergencyRequest.startDate).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày kết thúc</label>
              <p className="text-sm text-gray-900">{new Date(log.emergencyRequest.endDate).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Lý do từ chối</label>
              <p className="text-sm text-gray-900">{log.emergencyRequest.rejectionReason || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Ghi chú</label>
              <p className="text-sm text-gray-900">{log.note}</p>
            </div>            
            <div>
              <label className="text-sm font-medium">Nhân viên xử lý</label>
              <p className="text-sm text-gray-900">
                {log.staff ? `${log.staff.firstName} ${log.staff.lastName} (${log.staff.role})` : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}