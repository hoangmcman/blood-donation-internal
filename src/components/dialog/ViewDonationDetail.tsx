import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useGetDonationRequestById } from "@/services/donations"

interface ViewDonationDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  donationId: string
}

export default function ViewDonationDetail({ open, onOpenChange, donationId }: ViewDonationDetailProps) {
  const { data, isLoading, error } = useGetDonationRequestById(donationId)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      case "completed":
        return "bg-green-100 text-green-700"
      case "result_returned":
        return "bg-blue-100 text-blue-700"
      case "appointment_confirmed":
        return "bg-purple-100 text-purple-700"
      case "appointment_cancelled":
        return "bg-orange-100 text-orange-700"
      case "appointment_absent":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu hiến máu</DialogTitle>
          </DialogHeader>
          <div>Đang tải...</div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !data) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu hiến máu</DialogTitle>
          </DialogHeader>
          <div>Lỗi: {error?.message || "Không thể tải chi tiết yêu cầu hiến máu"}</div>
        </DialogContent>
      </Dialog>
    )
  }

  const donation = data

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chi tiết yêu cầu hiến máu</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Chiến dịch</label>
              <p className="text-sm text-gray-900">{donation.campaign?.name || "Không xác định"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <p className="text-sm text-gray-900">{donation.campaign?.description || "Không có"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày bắt đầu</label>
              <p className="text-sm text-gray-900">
                {donation.campaign?.startDate ? new Date(donation.campaign.startDate).toLocaleDateString('vi-VN') : "Không có"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày kết thúc</label>
              <p className="text-sm text-gray-900">
                {donation.campaign?.endDate ? new Date(donation.campaign.endDate).toLocaleDateString('vi-VN') : "Không có"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <p className="text-sm text-gray-900">
                <Badge className={getStatusColor(donation.currentStatus || "pending")}>
                  {donation.currentStatus === "pending" ? "Request chờ duyệt" :
                   donation.currentStatus === "rejected" ? "Request bị từ chối" :
                   donation.currentStatus === "completed" ? "Lấy máu thành công, chưa trả kết quả" :
                   donation.currentStatus === "result_returned" ? "Đã trả kết quả chính thức" :
                   donation.currentStatus === "appointment_confirmed" ? "Xác nhận request" :
                   donation.currentStatus === "appointment_cancelled" ? "Hủy lịch hẹn" :
                   donation.currentStatus === "appointment_absent" ? "Vắng mặt vào ngày lấy máu" :
                   donation.currentStatus}
                </Badge>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày hẹn</label>
              <p className="text-sm text-gray-900">
                {donation.appointmentDate ? new Date(donation.appointmentDate).toLocaleDateString('vi-VN') : "Không có"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày tạo</label>
              <p className="text-sm text-gray-900">
                {new Date(donation.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Người hiến máu</label>
              <p className="text-sm text-gray-900">
                {donation.donor?.firstName || "Không xác định"} {donation.donor?.lastName || ""}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Nhóm máu</label>
              <p className="text-sm text-gray-900">
                {donation.donor?.bloodType?.group || "Không có"}{donation.donor?.bloodType?.rh || ""}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Số điện thoại</label>
              <p className="text-sm text-gray-900">{donation.donor?.phone || "Không có"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Địa điểm</label>
              <p className="text-sm text-gray-900">{donation.campaign?.location || "Không có"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Phường/Xã</label>
              <p className="text-sm text-gray-900">{donation.donor?.wardName || "Không có"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Quận/Huyện</label>
              <p className="text-sm text-gray-900">{donation.donor?.districtName || "Không có"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Tỉnh/Thành phố</label>
              <p className="text-sm text-gray-900">{donation.donor?.provinceName || "Không có"}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}