"use client"

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useCreateBlog } from "../../services/blog"

const formSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  content: z.string().min(1, "Nội dung là bắt buộc"),
  excerpt: z.string().min(1, "Tóm tắt là bắt buộc"),
  imageUrl: z.string().url("Định dạng URL không hợp lệ"),
  tags: z.array(z.string()).min(1, "Ít nhất một tag là bắt buộc"),
  status: z.enum(["draft", "published", "archived"], {
    errorMap: () => ({ message: "Trạng thái phải là Nháp, Đã xuất bản, hoặc Lưu trữ" }),
  }),
});

interface CreateBlogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateBlogDialog({ open, onOpenChange }: CreateBlogDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      imageUrl: "",
      tags: [],
      status: "draft",
    },
  })

  const createMutation = useCreateBlog()

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Tạo slug từ title
    const slug = values.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // bỏ ký tự đặc biệt
      .replace(/\s+/g, '-')     // thay khoảng trắng bằng -
    try {
      await createMutation.mutateAsync({ ...values, slug })
      toast.success("Tạo bài blog thành công")
      onOpenChange(false)
    } catch (error) {
      toast.error("Tạo bài blog thất bại")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo bài blog mới</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Nháp</SelectItem>
                      <SelectItem value="published">Đã xuất bản</SelectItem>
                      <SelectItem value="archived">Lưu trữ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Nội dung</FormLabel>
                  <FormControl>
                    <div className="h-60 overflow-y-auto border rounded-md">
                      <ReactQuill
                        value={field.value}
                        onChange={field.onChange}
                        className="h-full [&>.ql-container]:h-full"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Tóm tắt</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Hình ảnh</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value.join(",")}
                      onChange={(e) => field.onChange(e.target.value.split(","))}
                      placeholder="Nhập tags, cách nhau bằng dấu phẩy"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="col-span-2">Tạo bài blog</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}