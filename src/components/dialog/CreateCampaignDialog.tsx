"use client"

import { Loader2Icon } from "lucide-react"
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
import { toast } from "sonner"
import { useCreateCampaign } from "../../services/campaign"

const formSchema = z.object({
  name: z.string().min(1, "Tên chiến dịch là bắt buộc"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Ngày bắt đầu là bắt buộc"),
  endDate: z.string().optional(),
  banner: z.string().url("Định dạng URL không hợp lệ"),
  location: z.string().min(1, "Địa điểm là bắt buộc"),
  limitDonation: z.number().min(1, "Giới hạn quyên góp phải ít nhất là 1"),
  bloodCollectionDate: z.string().min(1, "Ngày thu thập máu là bắt buộc"),
});

interface CreateCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ButtonLoading() {
  return (
    <Button size="sm" disabled className="col-span-2">
      <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
      Vui lòng chờ
    </Button>
  )
}

export function CreateCampaignDialog({ open, onOpenChange }: CreateCampaignDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      banner: "",
      location: "",
      limitDonation: 0,
      bloodCollectionDate: "",
    },
  })

  const createMutation = useCreateCampaign()

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const start = new Date(values.startDate);
    const end = new Date(values.endDate || values.startDate);
    const currentDate = new Date();
    let status: "not_started" | "active" | "ended";
    if (currentDate < start) {
      status = "not_started";
    } else if (!values.endDate || (currentDate >= start && currentDate <= end)) {
      status = "active";
    } else {
      status = "ended";
    }

    try {
      await createMutation.mutateAsync({ ...values, status })
      toast.success("Tạo chiến dịch thành công")
      onOpenChange(false)
    } catch (error) {
      toast.error("Tạo chiến dịch thất bại")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo chiến dịch mới</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-2">
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
            {createMutation.isPending ? (
              <ButtonLoading />
            ) : (
              <Button type="submit" className="col-span-2">Tạo chiến dịch</Button>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}