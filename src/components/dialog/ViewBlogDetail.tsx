"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useGetBlogById } from "../../services/blog"

interface ViewBlogDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blogId: string
}

type Blog = {
  id: string
  title: string
  content: string
  excerpt: string
  imageUrl?: string
  slug: string
  tags: string[]
  status: string
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
}

export function ViewBlogDetail({ open, onOpenChange, blogId }: ViewBlogDetailProps) {
  const { data, isLoading, error } = useGetBlogById(blogId)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "bg-yellow-100 text-yellow-700"
      case "published":
        return "bg-green-100 text-green-700"
      case "archived":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Blog Details</DialogTitle>
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
            <DialogTitle>Blog Details</DialogTitle>
          </DialogHeader>
          <div>Error: {error?.message || "Failed to load blog details"}</div>
        </DialogContent>
      </Dialog>
    )
  }

  const blog = data.data as Blog

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Blog Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <p className="text-sm text-gray-900">{blog.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <p className="text-sm text-gray-900" dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <p className="text-sm text-gray-900">
                <Badge className={getStatusColor(blog.status)}>
                  {blog.status === "draft" ? "Nháp" :
                   blog.status === "published" ? "Đã xuất bản" :
                   blog.status === "archived" ? "Lưu trữ" : blog.status}
                </Badge>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Published At</label>
              <p className="text-sm text-gray-900">
                {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Excerpt</label>
              <p className="text-sm text-gray-900">{blog.excerpt}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Image URL</label>
              <p className="text-sm text-gray-900">
                {blog.imageUrl ? (
                  <a href={blog.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Image
                  </a>
                ) : "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <p className="text-sm text-gray-900">{blog.slug}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Tags</label>
              <p className="text-sm text-gray-900">{blog.tags.join(", ")}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}