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
import { useCreateBloodUnit } from "../../services/inventory"
import { toast } from "sonner"

const formSchema = z.object({
  bloodGroup: z.string().min(1, { message: "Nhóm máu là bắt buộc" }),
  bloodRh: z.string().min(1, { message: "Rh máu là bắt buộc" }),
  bloodVolume: z.number().min(1, { message: "Dung tích máu phải lớn hơn 0" }),
  remainingVolume: z.number().min(0, { message: "Dung tích còn lại phải ít nhất là 0" }),
  expiredDate: z.string().min(1, { message: "Ngày hết hạn là bắt buộc" }),
  status: z.enum(["available", "used", "expired", "damaged"], { required_error: "Trạng thái là bắt buộc" }),
});

interface CreateBloodUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
}

export default function CreateBloodUnitDialog({ open, onOpenChange, memberId, memberName }: CreateBloodUnitDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bloodGroup: "",
      bloodRh: "",
      bloodVolume: 0,
      remainingVolume: 0,
      expiredDate: "",
      status: "available",
    },
  });

  const { mutate } = useCreateBloodUnit();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(
      {
        memberId,
        bloodGroup: values.bloodGroup,
        bloodRh: values.bloodRh,
        bloodVolume: values.bloodVolume,
        remainingVolume: values.remainingVolume,
        expiredDate: values.expiredDate,
        status: values.status,
      },
      {
        onSuccess: () => {
          toast.success("Tạo đơn vị máu thành công");
          onOpenChange(false);
          form.reset();
        },
        onError: () => {
          toast.error("Tạo đơn vị máu thất bại");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo đơn vị máu mới</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bloodGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhóm máu</FormLabel>
                  <FormControl>
                    <input {...field} className="w-full p-2 border rounded" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bloodRh"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rh máu</FormLabel>
                  <FormControl>
                    <input {...field} className="w-full p-2 border rounded" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bloodVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dung tích máu (ml)</FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="remainingVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dung tích còn lại (ml)</FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiredDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày hết hạn</FormLabel>
                  <FormControl>
                    <input type="date" {...field} className="w-full p-2 border rounded" />
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
                  <FormControl>
                    <select {...field} className="w-full p-2 border rounded">
                      <option value="available">Có sẵn</option>
                      <option value="used">Đã sử dụng</option>
                      <option value="expired">Hết hạn</option>
                      <option value="damaged">Hư hỏng</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Thành viên</FormLabel>
              <div className="p-2 border rounded bg-gray-100 text-sm">
                {memberName} (ID: {memberId})
              </div>
            </FormItem>
            <Button type="submit">Tạo đơn vị máu</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}