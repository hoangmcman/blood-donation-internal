import { useForm } from "react-hook-form"
import { useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useGetDonationRequestById, useUpdateDonationStatus } from "@/services/donations"

interface UpdateDonationRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  donationId: string
}

const formSchema = z.object({
  status: z.enum(["pending", "rejected", "completed", "result_returned", "appointment_confirmed", "appointment_cancelled", "appointment_absent"], { required_error: "Trạng thái là bắt buộc" }),
  appointmentDate: z.string().optional(),
  note: z.string().optional(),
})

const VALID_STATUSES = [
  "pending",
  "rejected",
  "completed",
  "result_returned",
  "appointment_confirmed",
  "appointment_cancelled",
  "appointment_absent",
] as const;

export default function UpdateDonationRequestDialog({
  open,
  onOpenChange,
  donationId,
}: UpdateDonationRequestDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "pending", // Default to "pending" as initial state
      appointmentDate: "",
      note: "",
    },
  })

  const { data: donationData } = useGetDonationRequestById(donationId)
  const { mutate } = useUpdateDonationStatus()

  useEffect(() => {
    if (donationData) {
      const validStatus = VALID_STATUSES.includes(donationData.currentStatus as any)
        ? donationData.currentStatus
        : "pending";
      form.reset({
        status: validStatus as typeof VALID_STATUSES[number],
        appointmentDate: donationData.appointmentDate
          ? new Date(donationData.appointmentDate).toISOString()
          : "",
        note: "",
      })
    }
  }, [donationData, form])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(
      { id: donationId, statusData: values },
      {
        onSuccess: () => {
          toast.success("Cập nhật trạng thái thành công")
          onOpenChange(false)
          window.location.reload()
        },
        onError: () => {
          toast.error("Cập nhật trạng thái thất bại")
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái yêu cầu hiến máu</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full p-2 border rounded">
                      <option value="pending">Request chờ duyệt</option>
                      <option value="rejected">Request bị từ chối</option>
                      <option value="completed">Lấy máu thành công, chưa trả kết quả</option>
                      <option value="result_returned">Đã trả kết quả chính thức</option>
                      <option value="appointment_confirmed">Xác nhận request</option>
                      <option value="appointment_cancelled">Hủy lịch hẹn</option>
                      <option value="appointment_absent">Vắng mặt vào ngày lấy máu</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appointmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày hẹn (có giờ)</FormLabel>
                  <FormControl>
                    <input
                      type="datetime-local"
                      {...field}
                      className="w-full p-2 border rounded"
                      value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value).toISOString())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Cập nhật trạng thái</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}