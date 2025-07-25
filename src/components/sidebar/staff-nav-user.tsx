"use client";

import { LogOutIcon, MoreVerticalIcon, UserCircleIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { useStaffProfile } from "@/hooks/use-staff-profile";
import { useClerk, useUser } from "@clerk/clerk-react";

export function StaffNavUser() {
	const { data: profile } = useStaffProfile();
	const { user } = useUser();
	const { signOut } = useClerk();
	const navigate = useNavigate();
	const { isMobile } = useSidebar();

	if (!profile || !user) {
		return null; // Return null if user is not loaded yet
	}

	const handleSignOut = async () => {
		await signOut({ redirectUrl: "/staff/login" }); // Redirect to /login after signing out
		navigate("/staff/login"); // Ensure client-side navigation to /login
	};

	const handleViewProfile = () => {
		navigate("/staff/staffprofile"); // Redirect to staff profile page
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
								<AvatarImage
									src={profile.avatar}
									alt={`${profile.firstName} ${profile.lastName}` || "User"}
								/>
								<AvatarFallback className="rounded-lg">
									{profile.firstName ? profile.firstName.charAt(0) : "U"}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">
									{`${profile.firstName} ${profile.lastName}` || "User"}
								</span>
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
									<AvatarImage src={profile.avatar} alt={profile.firstName || "User"} />
									<AvatarFallback className="rounded-lg">
										{profile.firstName ? profile.firstName.charAt(0) : "U"}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{`${profile.firstName} ${profile.lastName}` || "User"}
									</span>
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
	);
}
