"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useRejectEmergencyRequest } from "../../services/emergencyrequest"
import { useGetEmergencyRequestLogById } from "../../services/emergencyrequest"

const formSchema = z.object({
  rejectionReason: z.string().min(1, { message: "Lý do từ chối là bắt buộc" }),
})

interface RejectEmergencyRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
}

export function RejectEmergencyRequestDialog({ open, onOpenChange, requestId }: RejectEmergencyRequestDialogProps) {
  const { data, isLoading, error } = useGetEmergencyRequestLogById(requestId)
  const { mutate } = useRejectEmergencyRequest()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rejectionReason: "",
    },
  })

  const handleReject = (values: z.infer<typeof formSchema>) => {
    if (data?.data?.emergencyRequest) {
      mutate(
        { id: requestId, payload: values },
        {
          onSuccess: () => {
            toast.success("Từ chối yêu cầu thành công")
            onOpenChange(false)
          },
          onError: () => {
            toast.error("Từ chối yêu cầu thất bại")
          },
        }
      )
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bạn đang từ chối một yêu cầu, hãy điền lý do từ chối</DialogTitle>
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
            <DialogTitle>Bạn đang từ chối một yêu cầu, hãy điền lý do từ chối</DialogTitle>
          </DialogHeader>
          <div>Error: {error?.message || "Failed to load request details"}</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bạn đang từ chối một yêu cầu, hãy điền lý do từ chối</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleReject)} className="space-y-4">
            <FormField
              control={form.control}
              name="rejectionReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do từ chối</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Nhập lý do từ chối" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Từ chối</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}