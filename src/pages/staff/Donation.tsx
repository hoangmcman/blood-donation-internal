"use client"

import React from "react"
import { DonationTable } from "@/components/donation-table"
import ViewDonationDetail from "@/components/dialog/ViewDonationDetail"
import UpdateDonationStatus from "@/components/dialog/UpdateDonationStatus"

export default function Donation() {
  const [viewOpen, setViewOpen] = React.useState(false)
  const [updateOpen, setUpdateOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState("")

  return (
    <div className="p-6">
      <DonationTable onView={(id) => { setSelectedId(id); setViewOpen(true) }} onUpdate={(id) => { setSelectedId(id); setUpdateOpen(true) }} />
      <ViewDonationDetail
        open={viewOpen}
        onOpenChange={setViewOpen}
        donationId={selectedId}
      />
      <UpdateDonationStatus
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        donationId={selectedId}
      />
    </div>
  )
}