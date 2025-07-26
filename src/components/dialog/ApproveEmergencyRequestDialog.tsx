"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useState, useEffect } from "react"

import { useApproveEmergencyRequest, useGetEmergencyRequestById } from "@/services/emergencyrequest"
import { useGetBloodUnits } from "@/services/inventory"
import { BloodUnit } from "@/interfaces/inventory"
import { useSearchParams } from "react-router-dom"

interface ApproveEmergencyRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
}

// ✅ Hàm kiểm tra máu tương thích (dùng lại từ ViewRequired)
function isCompatible(
  requiredGroup: string,
  requiredRh: string,
  donorGroup: string,
  donorRh: string
): boolean {
  const compatibilityMap: Record<string, string[]> = {
    O: ["O"],
    A: ["A", "O"],
    B: ["B", "O"],
    AB: ["A", "B", "AB", "O"],
  }

  const rhCompatible =
    requiredRh === "+"
      ? donorRh === "+" || donorRh === "-"
      : donorRh === "-"

  return compatibilityMap[requiredGroup]?.includes(donorGroup) && rhCompatible
}

export function ApproveEmergencyRequestDialog({
  open,
  onOpenChange,
  requestId,
}: ApproveEmergencyRequestDialogProps) {
  const { data, isLoading, error } = useGetEmergencyRequestById(requestId)
  const { mutate } = useApproveEmergencyRequest()
  const [, setSearchParams] = useSearchParams();

  const { data: bloodUnitsData, isLoading: isBloodUnitsLoading, error: bloodUnitsError } = useGetBloodUnits({})

  const [filteredBloodUnits, setFilteredBloodUnits] = useState<BloodUnit[]>([])
  const [selectedBloodUnitId, setSelectedBloodUnitId] = useState<string>("")

  useEffect(() => {
    if (
      bloodUnitsData?.data?.data &&
      data?.data?.bloodType &&
      data?.data?.bloodTypeComponent
    ) {
      const requiredGroup = data.data.bloodType.group
      const requiredRh = data.data.bloodType.rh
      const requiredComponent = data.data.bloodTypeComponent

      const filtered = bloodUnitsData.data.data.filter(
        (unit) =>
          unit.bloodComponentType === requiredComponent &&
          isCompatible(requiredGroup, requiredRh, unit.bloodType.group, unit.bloodType.rh)
      )
      setFilteredBloodUnits(filtered)
    }
  }, [bloodUnitsData, data])

  if (isLoading || isBloodUnitsLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Duyệt yêu cầu - kiểm tra thông tin trước khi duyệt</DialogTitle>
          </DialogHeader>
          <div>Đang tải...</div>
        </DialogContent>
      </Dialog>
    )
  }

  if (
    error ||
    bloodUnitsError ||
    !data?.success ||
    !data?.data ||
    !bloodUnitsData?.success
  ) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Duyệt yêu cầu - kiểm tra thông tin trước khi duyệt</DialogTitle>
          </DialogHeader>
          <div>
            Lỗi: {error?.message || bloodUnitsError?.message || "Không thể tải dữ liệu"}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const request = data.data
  const requiredVolume = request.requiredVolume ?? 0

  const handleApprove = () => {
    const selectedUnit = filteredBloodUnits.find((u) => u.id === selectedBloodUnitId);
    if (!selectedUnit) {
      toast.error("Vui lòng chọn một đơn vị máu trước khi duyệt");
      return;
    }

    if (selectedUnit.remainingVolume < requiredVolume) {
      toast.error("Không đủ lượng máu trong đơn vị này để duyệt yêu cầu");
      return;
    }

    const payload = {
      bloodUnitId: selectedUnit.id,
      usedVolume: requiredVolume,
    };

    mutate(
      { id: requestId, payload },
      {
        onSuccess: () => {
          toast.success("Duyệt yêu cầu thành công");
          onOpenChange(false);

          // ✅ Set filter ngoài list thành 'approved'
          setSearchParams((prev) => {
            prev.set("status", "approved");
            prev.set("page", "1");
            return prev;
          });
        },
        onError: () => {
          toast.error("Duyệt yêu cầu thất bại");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-4xl max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 space-y-4">
          <DialogHeader className="mb-4 text-left">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Duyệt yêu cầu - kiểm tra thông tin trước khi duyệt
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm">
            <strong>Yêu cầu:</strong> {requiredVolume} ml - Nhóm máu{" "}
            {request.bloodType.group} {request.bloodType.rh} - Thành phần:{" "}
            {request.bloodTypeComponent}
          </p>
          <p className="text-sm">
            <strong>Dung tích sử dụng (usedVolume):</strong> {requiredVolume} ml
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhóm máu</TableHead>
                <TableHead>Rh</TableHead>
                <TableHead>Thành phần máu</TableHead>
                <TableHead>Thể tích máu hiện có (ml)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBloodUnits.length > 0 ? (
                filteredBloodUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>{unit.bloodType.group}</TableCell>
                    <TableCell>{unit.bloodType.rh}</TableCell>
                    <TableCell>{unit.bloodComponentType}</TableCell>
                    <TableCell>{unit.remainingVolume}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Không có đơn vị máu nào phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {filteredBloodUnits.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Chọn đơn vị máu để duyệt</label>
              <Select
                onValueChange={(value) => setSelectedBloodUnitId(value)}
                value={selectedBloodUnitId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn một đơn vị máu" />
                </SelectTrigger>
                <SelectContent>
                  {filteredBloodUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.id} - {unit.bloodType.group}
                      {unit.bloodType.rh} ({unit.remainingVolume} ml)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="button" onClick={handleApprove} disabled={!selectedBloodUnitId}>
            Duyệt yêu cầu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
