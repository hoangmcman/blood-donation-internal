"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useUpdateCampaign } from "@/services/campaign"

const formSchema = z.object({
  name: z.string().min(1, "Tên chiến dịch là bắt buộc"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  endDate: z.string().optional(),
  banner: z.string().url("Định dạng URL không hợp lệ"),
  location: z.string().min(1, "Địa điểm là bắt buộc"),
  limitDonation: z.number().min(1, "Giới hạn quyên góp phải ít nhất là 1"),
  status: z.enum(["active", "not_started", "ended"], {
    errorMap: () => ({ message: "Trạng thái phải là Hoạt động, Chưa bắt đầu, hoặc đã kết thúc" }),
  }),
  bloodCollectionDate: z.string().min(1, "Ngày thu thập máu là bắt buộc"),
});

interface EditCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: {
    id: string
    name: string
    description?: string
    startDate: string
    endDate?: string
    banner?: string
    location?: string
    limitDonation?: number
    status?: string
    bloodCollectionDate?: string
  }
}

export function EditCampaignDialog({ open, onOpenChange, campaign }: EditCampaignDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: campaign.name,
      description: campaign.description || "",
      startDate: campaign.startDate.split('T')[0],
      endDate: campaign.endDate?.split('T')[0] || "",
      banner: campaign?.banner || "",
      location: campaign?.location || "",
      limitDonation: campaign?.limitDonation || 0,
      status: campaign.status && ["active", "not_started", "ended"].includes(campaign.status)
        ? (campaign.status as "active" | "not_started" | "ended")
        : undefined,
      bloodCollectionDate: campaign.bloodCollectionDate?.split('T')[0] || "",
    },
  })

  const updateMutation = useUpdateCampaign()

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Cross-field validation for bloodCollectionDate
    const start = new Date(values.startDate);
    const end = new Date(values.endDate || values.startDate);
    const bloodDate = new Date(values.bloodCollectionDate);
    const diffStart = (bloodDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const diffEnd = (bloodDate.getTime() - end.getTime()) / (1000 * 60 * 60 * 24);
    if (!(diffStart > 7 && diffEnd >= 3)) {
      toast.error("Ngày thu thập máu phải cách ngày bắt đầu ít nhất 1 tuần và sau ngày kết thúc ít nhất 3 ngày");
      return;
    }
    try {
      await updateMutation.mutateAsync({ id: campaign.id, payload: values })
      toast.success("Cập nhật chiến dịch thành công")
      onOpenChange(false)
    } catch (error) {
      toast.error("Cập nhật chiến dịch thất bại")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa chiến dịch</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên chiến dịch</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="not_started">Chưa bắt đầu</SelectItem>
                      <SelectItem value="ended">Đã kết thúc</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày bắt đầu</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày kết thúc</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bloodCollectionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày thu thập máu</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="banner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Banner</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa điểm</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="limitDonation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giới hạn quyên góp</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="col-span-2">Cập nhật chiến dịch</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}