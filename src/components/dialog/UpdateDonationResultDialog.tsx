import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// ✅ Import API
import { useGetDonationRequestById, useUpdateDonationRequestResult } from "@/services/donations";

const formSchema = z.object({
  volumeMl: z.coerce.number().min(50, "Thể tích phải ít nhất 50ml"),
  bloodGroup: z.string().min(1, "Chọn nhóm máu"),
  bloodRh: z.string().min(1, "Chọn Rh"),
  notes: z.string().optional(),
  rejectReason: z.string().optional(),
  status: z.enum(["completed", "rejected"]),
});

type FormValues = z.infer<typeof formSchema>;

interface UpdateDonationResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  onSubmitResult?: (id: string, resultData: any) => void;
}

export default function UpdateDonationResultDialog({
  open,
  onOpenChange,
  memberId,
  memberName,
}: UpdateDonationResultDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      volumeMl: 0,
      bloodGroup: "",
      bloodRh: "",
      notes: "",
      rejectReason: "",
      status: "completed",
    },
  });

  const { data: donationRequest, isLoading } = useGetDonationRequestById(memberId);

  // ✅ Mutation cập nhật kết quả
  const { mutate: updateResult, isPending } = useUpdateDonationRequestResult();

  useEffect(() => {
    if (donationRequest) {
      form.reset({
        volumeMl: 0,
        bloodGroup: donationRequest.donor.bloodType?.group || "",
        bloodRh: donationRequest.donor.bloodType?.rh || "",
        notes: "",
        rejectReason: "",
        status: "completed",
      });
    }
  }, [donationRequest, form]);

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const handleSubmit = (values: FormValues) => {
    updateResult(
      {
        id: memberId,
        resultData: {
          volumeMl: values.volumeMl,
          bloodGroup: values.bloodGroup,
          bloodRh: values.bloodRh,
          notes: values.notes,
          rejectReason: values.rejectReason,
          status: values.status,
        },
      },
      {
        onSuccess: () => {
          toast.success("✅ Cập nhật kết quả hiến máu thành công!");
          onOpenChange(false);
        },
        onError: (err: any) => {
          toast.error(`❌ Lỗi: ${err.message}`);
        },
      }
    );
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Cập nhật kết quả hiến máu cho: <b>{memberName}</b>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="volumeMl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thể tích máu (ml)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bloodGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhóm máu</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhóm máu" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["A", "B", "AB", "O"].map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bloodRh"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rh</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn Rh" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="+">+</SelectItem>
                      <SelectItem value="-">-</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái kết quả</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="rejected">Từ chối</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("status") === "rejected" && (
              <FormField
                control={form.control}
                name="rejectReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lý do từ chối</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
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

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Đang cập nhật..." : "Cập nhật kết quả"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
