"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useGetCampaignById } from "../../services/campaign"

interface ViewCampaignDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
}

type Campaign = {
  id: string
  name: string
  description?: string
  startDate: string
  endDate?: string
  status: string
  banner: string
  location: string
  limitDonation: number
  bloodCollectionDate?: string
}

export function ViewCampaignDetail({ open, onOpenChange, campaignId }: ViewCampaignDetailProps) {
  const { data, isLoading, error } = useGetCampaignById(campaignId)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700"
      case "inactive":
        return "bg-yellow-100 text-yellow-700"
      case "completed":
        return "bg-blue-100 text-blue-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>
          <div>Loading...</div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !data?.success || !data?.data) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>
          <div>Error: {error?.message || "Failed to load campaign details"}</div>
        </DialogContent>
      </Dialog>
    )
  }

  // ép kiểu campaign để tránh lỗi
  const campaign = data.data as Campaign

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Campaign Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="text-sm text-gray-900">{campaign.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="text-sm text-gray-900">{campaign.description || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <p className="text-sm text-gray-900">
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <p className="text-sm text-gray-900">
                {new Date(campaign.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <p className="text-sm text-gray-900">
                {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Blood Collection Date</label>
              <p className="text-sm text-gray-900">
                {campaign.bloodCollectionDate ? new Date(campaign.bloodCollectionDate).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Banner URL</label>
              <p className="text-sm text-gray-900">
                <a href={campaign.banner} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  View Banner
                </a>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <p className="text-sm text-gray-900">{campaign.location}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Limit Donation</label>
              <p className="text-sm text-gray-900">{campaign.limitDonation}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}