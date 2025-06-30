"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useGetBloodUnitActionById } from "../../services/inventory"
import { StaffProfileService } from "../../services/staffProfile"
import { useQuery } from '@tanstack/react-query'

interface ViewBloodUnitActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionId: string;
}

export function ViewBloodUnitActionDialog({ open, onOpenChange, actionId }: ViewBloodUnitActionDialogProps) {
  const { data, isLoading, error } = useGetBloodUnitActionById(actionId);

  const getCurrentStaffProfile = () => {
    return useQuery({
      queryKey: ['currentStaffProfile'],
      queryFn: () => StaffProfileService.getProfile(),
    });
  };

  const { data: staffProfile } = getCurrentStaffProfile();

  const getActionDisplay = (action: string) => {
    return action === "status_update" ? "Cập nhật trạng thái" : "Thay đổi dung tích";
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chi tiết hành động</DialogTitle>
          </DialogHeader>
          <div>Đang tải...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !data?.success || !data?.data) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chi tiết hành động</DialogTitle>
          </DialogHeader>
          <div>Lỗi: {error?.message || "Không thể tải chi tiết hành động"}</div>
        </DialogContent>
      </Dialog>
    );
  }

  const action = data.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chi tiết hành động</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nhân viên</label>
            <p className="text-sm text-gray-900">{staffProfile?.firstName || `${action.staff.firstName} ${action.staff.lastName}`}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Hành động</label>
            <p className="text-sm text-gray-900">{getActionDisplay(action.action)}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Mô tả</label>
            <p className="text-sm text-gray-900">{action.description}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Giá trị trước</label>
            <p className="text-sm text-gray-900">{action.previousValue}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Giá trị mới</label>
            <p className="text-sm text-gray-900">{action.newValue}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Ngày tạo</label>
            <p className="text-sm text-gray-900">
              {new Date(action.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Ngày cập nhật</label>
            <p className="text-sm text-gray-900">
              {new Date(action.updatedAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}