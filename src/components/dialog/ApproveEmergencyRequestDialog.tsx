"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useApproveEmergencyRequest, useGetEmergencyRequestById } from "../../services/emergencyrequest"
import { toast } from "sonner"

interface ApproveEmergencyRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
}

export function ApproveEmergencyRequestDialog({ open, onOpenChange, requestId }: ApproveEmergencyRequestDialogProps) {
  const { data, isLoading, error } = useGetEmergencyRequestById(requestId)
  const { mutate } = useApproveEmergencyRequest()

  const handleApprove = () => {
    if (data?.data) {
      const payload = {
        bloodUnitId: data.data.bloodUnit || "",
        usedVolume: data.data.usedVolume.toString(),
      }
      mutate(
        { id: requestId, payload },
        {
          onSuccess: () => {
            toast.success("Duyệt yêu cầu thành công")
            onOpenChange(false)
          },
          onError: () => {
            toast.error("Duyệt yêu cầu thất bại")
          },
        }
      )
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bạn đang tính duyệt một yêu cầu, hãy kiểm tra thông tin trước khi duyệt</DialogTitle>
          </DialogHeader>
          <div>Đang tải...</div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !data?.success || !data?.data) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bạn đang tính duyệt một yêu cầu, hãy kiểm tra thông tin trước khi duyệt</DialogTitle>
          </DialogHeader>
          <div>Lỗi: {error?.message || "Không thể tải chi tiết yêu cầu"}</div>
        </DialogContent>
      </Dialog>
    )
  }

  const { bloodUnit, usedVolume } = data.data

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bạn đang tính duyệt một yêu cầu, hãy kiểm tra thông tin trước khi duyệt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Mã đơn vị máu</label>
            <p className="text-sm text-gray-900">{bloodUnit || "Không có"}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Dung tích sử dụng (ml)</label>
            <p className="text-sm text-gray-900">{usedVolume}</p>
          </div>
          <Button type="button" onClick={handleApprove}>Duyệt</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}