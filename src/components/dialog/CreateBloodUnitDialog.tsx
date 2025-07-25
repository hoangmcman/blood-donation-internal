"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateBloodUnit } from "../../services/inventory";
import { useGetDonationRequestById } from "../../services/donations";
import { toast } from "sonner";

const formSchema = z.object({
  bloodGroup: z.string().min(1, { message: "Nhóm máu là bắt buộc" }),
  bloodRh: z.string().min(1, { message: "Rh máu là bắt buộc" }),
  bloodVolume: z.number().min(1, { message: "Dung tích máu phải lớn hơn 0" }),
  remainingVolume: z.number().min(0, { message: "Dung tích còn lại phải ít nhất là 0" }),
  expiredDate: z.string().min(1, { message: "Ngày hết hạn là bắt buộc" }),
});

interface CreateBloodUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string; // thực ra đây là donationRequestId
  memberName: string;
}

export default function CreateBloodUnitDialog({
  open,
  onOpenChange,
  memberId,
}: CreateBloodUnitDialogProps) {
  const { data: donationRequest, isLoading } = useGetDonationRequestById(memberId);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bloodGroup: "",
      bloodRh: "",
      bloodVolume: 0,
      remainingVolume: 0,
      expiredDate: "",
    },
  });

  React.useEffect(() => {
    if (donationRequest && !isLoading) {
      form.reset({
        bloodGroup: donationRequest.donor.bloodType?.group || "",
        bloodRh: donationRequest.donor.bloodType?.rh || "",
        bloodVolume: 0,
        remainingVolume: 0,
        expiredDate: "",
      });
    }
  }, [donationRequest, isLoading, form]);

  const { mutate } = useCreateBloodUnit();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(
      {
        memberId: donationRequest!.donor!.id,
        bloodGroup: values.bloodGroup,
        bloodRh: values.bloodRh,
        bloodVolume: values.bloodVolume,
        remainingVolume: values.remainingVolume,
        expiredDate: values.expiredDate,
      },
      {
        onSuccess: () => {
          toast.success("Tạo đơn vị máu thành công");
          onOpenChange(false);
          form.reset();
        },
        onError: (err: any) => {
          console.error(err);
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
                    <input
                      {...field}
                      className="w-full p-2 border rounded"
                      disabled
                    />
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
                    <input
                      {...field}
                      className="w-full p-2 border rounded"
                      disabled
                    />
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
            <Button type="submit" disabled={isLoading}>
              Tạo đơn vị máu
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
