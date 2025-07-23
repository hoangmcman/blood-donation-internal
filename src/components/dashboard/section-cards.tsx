import { useGetDashboardSummary } from "@/services/dashboard"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export function SectionCards() {
  const [totalDonationsRange, setTotalDonationsRange] = useState("year")
  const [completedDonationsRange, setCompletedDonationsRange] = useState("year")
  const [totalBloodVolumeRange, setTotalBloodVolumeRange] = useState("year")
  const [uniqueDonorsRange, setUniqueDonorsRange] = useState("year")

  const currentDate = new Date()

  const getDateRange = (range: string) => {
    let startDate, endDate
    switch (range) {
      case "week":
        const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()))
        startDate = startOfWeek.toISOString().split("T")[0]
        endDate = new Date().toISOString().split("T")[0]
        break
      case "month":
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        startDate = startOfMonth.toISOString().split("T")[0]
        endDate = new Date().toISOString().split("T")[0]
        break
      case "year":
      default:
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1)
        startDate = startOfYear.toISOString().split("T")[0]
        endDate = new Date().toISOString().split("T")[0]
        break
    }
    return { startDate, endDate }
  }

  const { data: totalDonationsSummary, isLoading: isTotalDonationsLoading } = useGetDashboardSummary(
    getDateRange(totalDonationsRange).startDate,
    getDateRange(totalDonationsRange).endDate
  )
  const { data: completedDonationsSummary, isLoading: isCompletedDonationsLoading } = useGetDashboardSummary(
    getDateRange(completedDonationsRange).startDate,
    getDateRange(completedDonationsRange).endDate
  )
  const { data: totalBloodVolumeSummary, isLoading: isTotalBloodVolumeLoading } = useGetDashboardSummary(
    getDateRange(totalBloodVolumeRange).startDate,
    getDateRange(totalBloodVolumeRange).endDate
  )
  const { data: uniqueDonorsSummary, isLoading: isUniqueDonorsLoading } = useGetDashboardSummary(
    getDateRange(uniqueDonorsRange).startDate,
    getDateRange(uniqueDonorsRange).endDate
  )

  if (isTotalDonationsLoading || isCompletedDonationsLoading || isTotalBloodVolumeLoading || isUniqueDonorsLoading) {
    return (
      <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
        <Card className="@container/card"><CardHeader>Loading...</CardHeader></Card>
        <Card className="@container/card"><CardHeader>Loading...</CardHeader></Card>
        <Card className="@container/card"><CardHeader>Loading...</CardHeader></Card>
        <Card className="@container/card"><CardHeader>Loading...</CardHeader></Card>
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">

      {/* ✅ Total Donations */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Tổng số lượt hiến máu</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {totalDonationsSummary?.data.totalDonations || 0}
          </CardTitle>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1 text-sm">         
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Xem số lượt hiến máu theo</span>
            <Select value={totalDonationsRange} onValueChange={setTotalDonationsRange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Tuần</SelectItem>
                <SelectItem value="month">Tháng</SelectItem>
                <SelectItem value="year">Năm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardFooter>
      </Card>


      {/* ✅ Completed Donations */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Các lượt hiến máu thành công</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {completedDonationsSummary?.data.completedDonations || 0}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">         
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Xem xu hướng lượt hiến máu thành công theo</span>
            <Select value={completedDonationsRange} onValueChange={setCompletedDonationsRange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Tuần</SelectItem>
                <SelectItem value="month">Tháng</SelectItem>
                <SelectItem value="year">Năm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardFooter>
      </Card>

      {/* ✅ Total Blood Volume */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Tổng lượng máu</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {totalBloodVolumeSummary?.data.totalBloodVolume || 0} ml
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">         
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Xem lượng máu hiện có theo</span>
            <Select value={totalBloodVolumeRange} onValueChange={setTotalBloodVolumeRange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Tuần</SelectItem>
                <SelectItem value="month">Tháng</SelectItem>
                <SelectItem value="year">Năm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardFooter>
      </Card>

      {/* ✅ Unique Donors */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Số lượng người hiến máu gần đây</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {uniqueDonorsSummary?.data.uniqueDonors || 0}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Xem lượt người hiến máu gần đây theo</span>
            <Select value={uniqueDonorsRange} onValueChange={setUniqueDonorsRange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Tuần</SelectItem>
                <SelectItem value="month">Tháng</SelectItem>
                <SelectItem value="year">Năm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardFooter>
      </Card>

    </div>
  )
}
