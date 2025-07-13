"use client"

import { useForm, useFieldArray } from "react-hook-form"
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
import { TrashIcon } from "lucide-react"
import { useCreateDonationResultTemplate } from "../../services/donationresulttemplates"

const formSchema = z.object({
  name: z.string().min(1, "Tên mẫu là bắt buộc"),
  description: z.string().min(1, "Mô tả là bắt buộc"),
  active: z.boolean(),
  items: z.array(z.object({
    type: z.string().min(1, "Loại là bắt buộc"),
    label: z.string().min(1, "Nhãn là bắt buộc"),
    description: z.string().min(1, "Mô tả là bắt buộc"),
    placeholder: z.string().optional(),
    defaultValue: z.string().optional(),
    sortOrder: z.number().min(0),
    minValue: z.number().optional(),
    maxValue: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    isRequired: z.boolean(),
    pattern: z.string().optional(),
    options: z.array(z.object({
      label: z.string().min(1, "Nhãn tùy chọn là bắt buộc"),
    })).optional(),
  })),
})

interface CreateDonationResultTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateDonationResultTemplateDialog({ open, onOpenChange }: CreateDonationResultTemplateDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      active: true,
      items: [{ type: "", label: "", description: "", sortOrder: 0, isRequired: false, options: [] }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const createMutation = useCreateDonationResultTemplate()

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createMutation.mutateAsync(values)
      toast.success("Tạo mẫu thành công")
      form.reset({
        name: "",
        description: "",
        active: true,
        items: [{ type: "", label: "", description: "", sortOrder: 0, isRequired: false, options: [] }],
      })
      onOpenChange(false)
    } catch (error) {
      toast.error("Tạo mẫu thất bại")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Mẫu Kết Quả Quyên Góp Mới</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên mẫu</FormLabel>
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
                <FormItem>
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
              name="active"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hoạt động</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Hoạt động</SelectItem>
                      <SelectItem value="false">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {fields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-md">
                <FormField
                  control={form.control}
                  name={`items.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại mục {index + 1}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="radio">Radio</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.label`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhãn</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
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
                  name={`items.${index}.sortOrder`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thứ tự</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${index}.isRequired`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bắt buộc</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Có</SelectItem>
                          <SelectItem value="false">Không</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {["select", "radio"].includes(form.watch(`items.${index}.type`)) && (
                  <FormField
                    control={form.control}
                    name={`items.${index}.options`}
                    render={({ field }) => {
                      const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
                        control: form.control,
                        name: `items.${index}.options` as const,
                      })
                      return (
                        <FormItem>
                          <FormLabel>Tùy chọn</FormLabel>
                          {optionFields.map((option, optionIndex) => (
                            <div key={option.id} className="flex items-center space-x-2 mb-2">
                              <FormControl>
                                <Input
                                  value={option.label}
                                  onChange={(e) => {
                                    const newOptions = [...(field.value || [])]
                                    newOptions[optionIndex] = { ...newOptions[optionIndex], label: e.target.value }
                                    field.onChange(newOptions)
                                  }}
                                  placeholder="Nhãn tùy chọn"
                                />
                              </FormControl>
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(optionIndex)}>
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button type="button" variant="outline" size="sm" onClick={() => appendOption({ label: "" })}>
                            Thêm tùy chọn
                          </Button>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => remove(index)} className="mt-2">
                  Xóa mục
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ type: "", label: "", description: "", sortOrder: 0, isRequired: false, options: [] })}>
              Thêm mục mới
            </Button>
            <Button type="submit" className="w-full">Tạo mẫu</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}