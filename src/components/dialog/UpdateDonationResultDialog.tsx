"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { useGetDonationRequestById } from "../../services/donations"
import { useUpdateDonationResult } from "../../services/donations"
import { type UpdateDonationResultPayload } from "../../services/donations"

interface UpdateDonationResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  donationResultId: string
}

export default function UpdateDonationResultDialog({
  open,
  onOpenChange,
  donationResultId,
}: UpdateDonationResultDialogProps) {
  const {
    data: requestData,
    isLoading: isRequestLoading,
    error: requestError,
  } = useGetDonationRequestById(donationResultId)

  const updateDonationResult = useUpdateDonationResult()

  const [formData, setFormData] = React.useState<UpdateDonationResultPayload>({
    volumeMl: 0,
    bloodgroup: "",
    bloodrh: "",
    notes: "",
    rejectReason: "",
    status: "completed",
  })

  React.useEffect(() => {
    if (requestData) {
      const donorBloodType = requestData.donor?.bloodType
      setFormData((prev) => ({
        ...prev,
        bloodGroup: donorBloodType?.group || "",
        bloodRh: donorBloodType?.rh || "",
      }))
    }
  }, [requestData])

  const handleInputChange = (
    field: keyof UpdateDonationResultPayload,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "volumeMl" ? Number(value) : value, // ✅ ép kiểu số cho volumeMl
    }))
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      notes: e.target.value,
    }))
  }

	const handleSubmit = async () => {
		try {
			await updateDonationResult.mutateAsync({
				id: donationResultId,
				updateData: formData,
			});
			toast.success("Cập nhật kết quả hiến máu thành công");
			onOpenChange(false);
		} catch (error) {
			toast.error("Lỗi khi cập nhật kết quả hiến máu");
		}
	};

  if (isRequestLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Cập nhật Kết quả Hiến máu</DialogTitle>
          </DialogHeader>
          <div>Đang tải...</div>
        </DialogContent>
      </Dialog>
    )
  }

  if (requestError || !requestData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Cập nhật Kết quả Hiến máu</DialogTitle>
          </DialogHeader>
          <div>
            Lỗi: {requestError?.message || "Không thể tải chi tiết yêu cầu"}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật Kết quả Hiến máu</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Lượng máu đã được hiến (ml)?</Label>
                <Input
                  type="number"
                  placeholder="Nhập lượng máu (ml)"
                  value={formData.volumeMl}
                  onChange={(e) =>
                    handleInputChange("volumeMl", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <Label>Nhóm máu (A, B, AB, O)</Label>
                <Input type="text" value={formData.bloodgroup} disabled />
              </div>
              <div>
                <Label>Yếu tố Rh (Dương tính hay âm tính)</Label>
                <Input type="text" value={formData.bloodrh} disabled />
              </div>
              <div>
                <Label>Ghi chú (nếu có)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={handleNotesChange}
                  placeholder="Nhập ghi chú nếu có"
                />
              </div>
              {formData.status === "rejected" && (
                <div>
                  <Label>Lý do từ chối</Label>
                  <Input
                    type="text"
                    value={formData.rejectReason}
                    onChange={(e) =>
                      handleInputChange("rejectReason", e.target.value)
                    }
                    placeholder="Nhập lý do từ chối"
                  />
                </div>
              )}
              <div>
                <Label>Trạng thái kết quả</Label>
                <RadioGroup
                  value={formData.status}
                  onValueChange={(value) =>
                    handleInputChange("status", value)
                  }
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="completed" id="completed" />
                    <Label htmlFor="completed">Hoàn thành</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rejected" id="rejected" />
                    <Label htmlFor="rejected">Bị từ chối</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateDonationResult.isPending}
          >
            {updateDonationResult.isPending
              ? "Đang cập nhật..."
              : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

