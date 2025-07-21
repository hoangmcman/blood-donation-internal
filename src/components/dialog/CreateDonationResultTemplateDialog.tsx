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
import { useCreateDonationResultTemplate, useCreateDonationResultTemplateItem, useCreateDonationResultTemplateOption } from "../../services/donationresulttemplates"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(1, { message: "Tên template là bắt buộc" }),
  description: z.string().min(1, { message: "Mô tả là bắt buộc" }),
  active: z.boolean(),
  items: z.array(
    z.object({
      type: z.enum(["text", "select", "radio"], { required_error: "Loại item là bắt buộc" }),
      label: z.string().min(1, { message: "Nhãn là bắt buộc" }),
      description: z.string().min(1, { message: "Mô tả item là bắt buộc" }),
      placeholder: z.string().optional(),
      defaultValue: z.string().optional(),
      sortOrder: z.number().min(0),
      isRequired: z.boolean(),
      options: z.array(z.object({ label: z.string().min(1) })).optional(),
    })
  ).min(1, { message: "Ít nhất một item là bắt buộc" }),
})

type FormValues = z.infer<typeof formSchema>

interface CreateDonationResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string;
}

export function CreateDonationResultTemplateDialog({ open, onOpenChange, templateId }: CreateDonationResultDialogProps) {
  const { mutate: createTemplate } = useCreateDonationResultTemplate()
  const { mutate: createItem } = useCreateDonationResultTemplateItem()
  const { mutate: createOption } = useCreateDonationResultTemplateOption()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      active: true,
      items: [
        {
          type: "text",
          label: "",
          description: "",
          sortOrder: 0,
          isRequired: false,
          options: [],
          placeholder: "",
          defaultValue: "",
        },
      ],
    },
  })

  const onSubmit = async (values: FormValues) => {
    if (templateId) {
      for (const item of values.items) {
        const { options = [], ...itemWithoutOptions } = item

        await new Promise<void>((resolve, reject) => {
          createItem(
            { templateId, payload: itemWithoutOptions },
            {
              onSuccess: (itemResponse) => {
                const optionPromises = options.map(option =>
                  new Promise<void>((res, rej) =>
                    createOption(
                      {
                        itemId: itemResponse.data.id,
                        payload: { label: option.label },
                      },
                      {
                        onSuccess: () => res(),
                        onError: () => rej(),
                      }
                    )
                  )
                )

                Promise.all(optionPromises)
                  .then(() => resolve())
                  .catch(reject)
              },
              onError: () => {
                toast.error("Tạo item thất bại")
                reject()
              },
            }
          )
        })
      }

      toast.success("Cập nhật template thành công")
      onOpenChange(false)
      form.reset()
    } else {
      createTemplate(
        {
          name: values.name,
          description: values.description,
          active: values.active,
          items: values.items,
        },
        {
          onSuccess: async (templateResponse) => {
            for (const item of values.items) {
              const { options = [], ...itemWithoutOptions } = item

              await new Promise<void>((resolve, reject) => {
                createItem(
                  { templateId: templateResponse.data.id, payload: itemWithoutOptions },
                  {
                    onSuccess: (itemResponse) => {
                      const optionPromises = options.map(option =>
                        new Promise<void>((res, rej) =>
                          createOption(
                            {
                              itemId: itemResponse.data.id,
                              payload: { label: option.label },
                            },
                            {
                              onSuccess: () => res(),
                              onError: () => rej(),
                            }
                          )
                        )
                      )

                      Promise.all(optionPromises)
                        .then(() => resolve())
                        .catch(reject)
                    },
                    onError: () => {
                      toast.error("Tạo item thất bại")
                      reject()
                    },
                  }
                )
              })
            }

            toast.success("Tạo template thành công")
            onOpenChange(false)
            form.reset()
          },
          onError: () => toast.error("Tạo template thất bại"),
        }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{templateId ? "Cập nhật" : "Tạo"} Template Kết Quả Quyên Góp</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Template</FormLabel>
                  <FormControl>
                    <input {...field} className="w-full p-2 border rounded" />
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
                    <input {...field} className="w-full p-2 border rounded" />
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
                  <FormLabel>Kích hoạt</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        className="mr-2 leading-tight"
                      />
                      <span>Kích hoạt template</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="items"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh sách Items</FormLabel>
                  {field.value.map((item, index) => (
                    <div key={index} className="p-2 border rounded mb-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.type`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <FormLabel>Loại Item</FormLabel>
                            <FormControl>
                              <select {...itemField} className="w-full p-2 border rounded">
                                <option value="text">Text</option>
                                <option value="select">Select</option>
                                <option value="radio">Radio</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.label`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <FormLabel>Nhãn</FormLabel>
                            <FormControl>
                              <input {...itemField} className="w-full p-2 border rounded" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <FormLabel>Mô tả Item</FormLabel>
                            <FormControl>
                              <input {...itemField} className="w-full p-2 border rounded" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.sortOrder`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <FormLabel>Thứ tự</FormLabel>
                            <FormControl>
                              <input
                                type="number"
                                {...itemField}
                                onChange={(e) => itemField.onChange(parseInt(e.target.value))}
                                className="w-full p-2 border rounded"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.isRequired`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <FormLabel>Bắt buộc</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={itemField.value}
                                  onChange={(e) => itemField.onChange(e.target.checked)}
                                  onBlur={itemField.onBlur}
                                  ref={itemField.ref}
                                  className="mr-2 leading-tight"
                                />
                                <span>Bắt buộc</span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {(item.type === "select" || item.type === "radio") && (
                        <FormField
                          control={form.control}
                          name={`items.${index}.options`}
                          render={({ field: optionField }) => (
                            <FormItem>
                              <FormLabel>Options</FormLabel>
                              {optionField.value?.map((opt, optIndex) => (
                                <div key={optIndex} className="p-2 border rounded mb-1">
                                  <FormControl>
                                    <input
                                      value={opt.label}
                                      onChange={(e) => {
                                        const newOptions = [...(optionField.value || [])]
                                        newOptions[optIndex] = { label: e.target.value }
                                        optionField.onChange(newOptions)
                                      }}
                                      className="w-full p-2 border rounded"
                                    />
                                  </FormControl>
                                </div>
                              ))}
                              <Button
                                type="button"
                                onClick={() => optionField.onChange([...(optionField.value || []), { label: "" }])}
                                className="mt-2"
                              >
                                Thêm Option
                              </Button>
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => field.onChange([...field.value, { type: "text", label: "", description: "", sortOrder: 0 }])}
                    className="mt-2"
                  >
                    Thêm Item
                  </Button>
                </FormItem>
              )}
            />
            <Button type="submit">Lưu Template</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}