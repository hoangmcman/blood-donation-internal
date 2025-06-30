"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import {
  CameraIcon,
  Cross,
  FlagTriangleRight,
  FileCodeIcon,
  FileTextIcon,
  ChartColumnStacked,
  UsersIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Giả sử NavUser là một thành phần được định nghĩa ở nơi khác
import { NavUser } from "@/components/sidebar/nav-user"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: ChartColumnStacked,
    },
    {
      title: "Chiến dịch",
      url: "/admin/campaign",
      icon: FlagTriangleRight,
    },
    {
      title: "Quản lý người dùng",
      url: "/admin/userlist",
      icon: UsersIcon,
    }
  ],
  navClouds: [
    {
      title: "Chụp ảnh",
      icon: CameraIcon,
      isActive: true,
      url: "/capture",
      items: [
        {
          title: "Đề xuất đang hoạt động",
          url: "/capture/active-proposals",
        },
        {
          title: "Đã lưu trữ",
          url: "/capture/archived",
        },
      ],
    },
    {
      title: "Đề xuất",
      icon: FileTextIcon,
      url: "/proposal",
      items: [
        {
          title: "Đề xuất đang hoạt động",
          url: "/proposal/active-proposals",
        },
        {
          title: "Đã lưu trữ",
          url: "/proposal/archived",
        },
      ],
    },
    {
      title: "Gợi ý",
      icon: FileCodeIcon,
      url: "/prompts",
      items: [
        {
          title: "Đề xuất đang hoạt động",
          url: "/prompts/active-proposals",
        },
        {
          title: "Đã lưu trữ",
          url: "/prompts/archived",
        },
      ],
    },
  ],
}

// Thành phần NavMain mới để xử lý điều hướng
function NavMain({ items }: { items: typeof data.navMain }) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild tooltip={item.title}>
            <Link to={item.url} className="flex items-center gap-2">
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/" className="flex items-center space-x-2">
                <Cross className="h-5 w-5 text-red-500" />
                <span className="text-base font-semibold">BloodLink</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}