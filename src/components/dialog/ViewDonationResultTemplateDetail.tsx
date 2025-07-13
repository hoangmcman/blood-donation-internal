"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useGetDonationResultTemplateById } from "../../services/donationresulttemplates"

interface ViewDonationResultTemplateDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateId: string
}

export function ViewDonationResultTemplateDetail({ open, onOpenChange, templateId }: ViewDonationResultTemplateDetailProps) {
  const { data, isLoading, error } = useGetDonationResultTemplateById(templateId)

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Chi tiết Mẫu</DialogTitle>
          </DialogHeader>
          <div>Loading...</div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !data?.success || !data?.data) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Chi tiết Mẫu</DialogTitle>
          </DialogHeader>
          <div>Error: {error?.message || "Failed to load template details"}</div>
        </DialogContent>
      </Dialog>
    )
  }

  const template = data.data

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết Mẫu</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tên mẫu</label>
              <p className="text-sm text-gray-900">{template.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Mô tả</label>
              <p className="text-sm text-gray-900">{template.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <p className="text-sm text-gray-900">
                <Badge className={template.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {template.active ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày tạo</label>
              <p className="text-sm text-gray-900">{new Date(template.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Ngày cập nhật</label>
              <p className="text-sm text-gray-900">{new Date(template.updatedAt).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Tạo bởi</label>
              <p className="text-sm text-gray-900">{`${template.createdBy.firstName} ${template.createdBy.lastName}`}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Cập nhật bởi</label>
              <p className="text-sm text-gray-900">{`${template.updatedBy.firstName} ${template.updatedBy.lastName}`}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Số mục</label>
              <p className="text-sm text-gray-900">{template.items.length}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}