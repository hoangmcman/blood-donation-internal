"use client"

import {
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
} from "lucide-react"
import { useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const { isMobile } = useSidebar();

  if (!user) {
    return null; // Return null if user is not loaded yet
  }

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/login' }); // Redirect to /login after signing out
    navigate("/login"); // Ensure client-side navigation to /login
  };

  const handleViewProfile = () => {
    navigate("/admin/adminprofile"); // Redirect to staff profile page
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
                <AvatarFallback className="rounded-lg">
                  {user.firstName ? user.firstName.charAt(0) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.fullName || "User"}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.primaryEmailAddress?.emailAddress || "No email"}
                </span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.imageUrl} alt={user.fullName || "User"} />
                  <AvatarFallback className="rounded-lg">
                    {user.firstName ? user.firstName.charAt(0) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.fullName || "User"}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.primaryEmailAddress?.emailAddress || "No email"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleViewProfile}>
                <UserCircleIcon className="mr-2 h-4 w-4" />
                Xem tài khoản
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}