"use client"

import { useEffect } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useUpdateBloodUnit, useGetBloodUnitById } from "../../services/inventory"
import { useQuery } from '@tanstack/react-query';
import { StaffProfileService } from "../../services/staffProfile"

const formSchema = z.object({
  bloodVolume: z.number().min(1, "Dung tích máu phải lớn hơn 0"),
  remainingVolume: z.number().min(0, "Dung tích còn lại phải ít nhất là 0"),
  expiredDate: z.string().min(1, "Ngày hết hạn là bắt buộc"),
  status: z.enum(["available", "used", "expired", "damaged"], { required_error: "Trạng thái là bắt buộc" }),
  staffId: z.string().optional(),
});

interface UpdateBloodUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bloodUnitId: string;
}

function useGetStaffProfile() {
  return useQuery({
    queryKey: ['staffProfile'],
    queryFn: () => StaffProfileService.getProfile(),
  });
}

export default function UpdateBloodUnitDialog({ open, onOpenChange, bloodUnitId }: UpdateBloodUnitDialogProps) {
  const { data: bloodUnitData } = useGetBloodUnitById(bloodUnitId);
  const { data: staffProfile } = useGetStaffProfile();
  const updateMutation = useUpdateBloodUnit();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bloodVolume: 0,
      remainingVolume: 0,
      expiredDate: "",
      status: "available",
      staffId: "",
    },
  });

  useEffect(() => {
    if (bloodUnitData?.data) {
      form.reset({
        bloodVolume: bloodUnitData.data.bloodVolume,
        remainingVolume: bloodUnitData.data.remainingVolume,
        expiredDate: bloodUnitData.data.expiredDate.split('T')[0],
        status: bloodUnitData.data.status as "available" | "used" | "expired" | "damaged",
        staffId: staffProfile ? `${staffProfile.firstName} ${staffProfile.lastName}` : "",
      });
    }
  }, [bloodUnitData, staffProfile, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateMutation.mutateAsync({ id: bloodUnitId, payload: values });
      toast.success("Cập nhật đơn vị máu thành công");
      onOpenChange(false);
    } catch (error) {
      toast.error("Cập nhật đơn vị máu thất bại");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cập nhật đơn vị máu</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="bloodVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dung tích máu (ml)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} readOnly disabled />
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
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiredDate"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Ngày hết hạn</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Trạng thái</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">Có sẵn</SelectItem>
                      <SelectItem value="used">Đã sử dụng</SelectItem>
                      <SelectItem value="expired">Hết hạn</SelectItem>
                      <SelectItem value="damaged">Hư hỏng</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem className="col-span-2">
              <FormLabel>Nhân viên</FormLabel>
              <div className="p-2 border rounded bg-gray-100 text-sm">
                {staffProfile?.firstName} {staffProfile?.lastName}
              </div>
            </FormItem>
            <Button type="submit" className="col-span-2">Cập nhật đơn vị máu</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}