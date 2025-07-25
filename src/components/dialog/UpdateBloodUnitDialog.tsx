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
import { toast } from "sonner"
import { useGetBloodUnitById, useSeparateComponents } from "../../services/inventory"
import { useQuery } from '@tanstack/react-query';
import { StaffProfileService } from "../../services/staffProfile"

const formSchema = z.object({
  redCellsVolume: z.number().min(1, "Dung tích hồng cầu phải lớn hơn 0"),
  redCellsExpiredDate: z.string().min(1, "Ngày hết hạn hồng cầu là bắt buộc"),
  plasmaVolume: z.number().min(1, "Dung tích huyết tương phải lớn hơn 0"),
  plasmaExpiredDate: z.string().min(1, "Ngày hết hạn huyết tương là bắt buộc"),
  plateletsVolume: z.number().min(1, "Dung tích tiểu cầu phải lớn hơn 0"),
  plateletsExpiredDate: z.string().min(1, "Ngày hết hạn tiểu cầu là bắt buộc"),
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
  const separateMutation = useSeparateComponents();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      redCellsVolume: 0,
      redCellsExpiredDate: "",
      plasmaVolume: 0,
      plasmaExpiredDate: "",
      plateletsVolume: 0,
      plateletsExpiredDate: "",
    },
  });

  const initialBloodVolume = bloodUnitData?.data?.bloodVolume || 0;
  const totalUsedVolume = form.watch(["redCellsVolume", "plasmaVolume", "plateletsVolume"]).reduce((sum, value) => sum + (value || 0), 0);
  const remainingVolume = initialBloodVolume - totalUsedVolume;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!staffProfile?.id) {
        throw new Error("Không thể lấy thông tin nhân viên");
      }

      await separateMutation.mutateAsync({
        wholeBloodUnitId: bloodUnitId,
        redCellsVolume: values.redCellsVolume,
        redCellsExpiredDate: values.redCellsExpiredDate,
        plasmaVolume: values.plasmaVolume,
        plasmaExpiredDate: values.plasmaExpiredDate,
        plateletsVolume: values.plateletsVolume,
        plateletsExpiredDate: values.plateletsExpiredDate,
      });
      toast.success("Tách máu thành công");
      onOpenChange(false);
    } catch (error) {
      toast.error("Tách máu thất bại");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tách đơn vị máu</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FormItem>
                <FormLabel>Tổng dung tích máu (ml)</FormLabel>
                <FormControl>
                  <Input type="number" value={initialBloodVolume} readOnly disabled />
                </FormControl>
                <p className="text-sm text-gray-500">Dung tích còn lại: {remainingVolume >= 0 ? remainingVolume : 0} ml</p>
              </FormItem>
            </div>
            <FormField
              control={form.control}
              name="redCellsVolume"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Dung tích hồng cầu (ml)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="redCellsExpiredDate"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Ngày hết hạn hồng cầu</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plasmaVolume"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Dung tích huyết tương (ml)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plasmaExpiredDate"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Ngày hết hạn huyết tương</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plateletsVolume"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Dung tích tiểu cầu (ml)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="plateletsExpiredDate"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Ngày hết hạn tiểu cầu</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="col-span-2" disabled={remainingVolume < 0}>Tách máu</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}