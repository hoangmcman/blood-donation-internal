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
import { useGetEmergencyRequestById } from "@/services/emergencyrequest"
import { useGetBloodUnits } from "@/services/inventory"
import { BloodUnit } from "@/interfaces/inventory"
import { useState, useEffect } from "react"

interface ViewRequiredBloodUnitsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    requestId: string
}

// ✅ Hàm kiểm tra máu tương thích theo quy tắc ABO + Rh
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

    return (
        compatibilityMap[requiredGroup]?.includes(donorGroup) && rhCompatible
    )
}

export function ViewRequiredBloodUnitsDialog({
    open,
    onOpenChange,
    requestId,
}: ViewRequiredBloodUnitsDialogProps) {
    const {
        data: emergencyData,
        isLoading: isEmergencyLoading,
        error: emergencyError,
    } = useGetEmergencyRequestById(requestId)

    const {
        data: bloodUnitsData,
        isLoading: isBloodUnitsLoading,
        error: bloodUnitsError,
    } = useGetBloodUnits({})

    const [filteredBloodUnits, setFilteredBloodUnits] = useState<BloodUnit[]>([])

    useEffect(() => {
        if (
            bloodUnitsData?.data?.data &&
            emergencyData?.data?.bloodType &&
            emergencyData?.data?.bloodTypeComponent
        ) {
            const requiredGroup = emergencyData.data.bloodType.group
            const requiredRh = emergencyData.data.bloodType.rh
            const requiredComponent = emergencyData.data.bloodTypeComponent

            const filtered = bloodUnitsData.data.data.filter(
                (unit) =>
                    unit.bloodComponentType === requiredComponent &&
                    isCompatible(
                        requiredGroup,
                        requiredRh,
                        unit.bloodType.group,
                        unit.bloodType.rh
                    )
            )

            setFilteredBloodUnits(filtered)
        }
    }, [bloodUnitsData, emergencyData])

    if (isEmergencyLoading || isBloodUnitsLoading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Xem lượng máu cần thiết</DialogTitle>
                    </DialogHeader>
                    <div>Loading...</div>
                </DialogContent>
            </Dialog>
        )
    }

    if (
        emergencyError ||
        bloodUnitsError ||
        !emergencyData?.success ||
        !bloodUnitsData?.success
    ) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Xem lượng máu cần thiết</DialogTitle>
                    </DialogHeader>
                    <div>
                        Error:{" "}
                        {emergencyError?.message ||
                            bloodUnitsError?.message ||
                            "Failed to load data"}
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-4xl max-w-6xl max-h-[90vh] overflow-y-auto p-0">
                <div className="p-6">
                    <DialogHeader className="mb-6 text-left">
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                            Xem lượng máu cần thiết
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mã đơn vị máu</TableHead>
                                    <TableHead>Nhóm máu</TableHead>
                                    <TableHead>Rh</TableHead>
                                    <TableHead>Thành phần máu</TableHead>
                                    <TableHead>Thể tích máu hiện có (ml)</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBloodUnits.length > 0 ? (
                                    filteredBloodUnits.map((unit) => (
                                        <TableRow key={unit.id}>
                                            <TableCell>{unit.id}</TableCell>
                                            <TableCell>{unit.bloodType.group}</TableCell>
                                            <TableCell>{unit.bloodType.rh}</TableCell>
                                            <TableCell>{unit.bloodComponentType}</TableCell>
                                            <TableCell>{unit.remainingVolume}</TableCell>
                                            <TableCell>{unit.status}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Không có đơn vị máu nào phù hợp.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
