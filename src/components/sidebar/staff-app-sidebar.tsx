"use client";

import {
	CameraIcon,
	Cross,
	Droplet,
	FileClock,
	FileCodeIcon,
	FileTextIcon,
	FlagTriangleRight,
	Newspaper,
} from "lucide-react";
import * as React from "react";
import { Link, useLocation } from "react-router-dom";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useAuthContext } from "../../providers/AuthProvider";
import { StaffNavUser } from "./staff-nav-user";

// Mock function to get user sub-role based on userId (replace with actual API call)
const getUserSubRole = (userId: string | null): "staff" | "doctor" => {
	// Based on provided schema
	if (userId === "user_2zSQsxizyGvxjpPLOPJUJ1Fq5nJ") return "staff";
	if (userId === "user_2zSQe5CvQDUSxEg7xsdr1q86q17") return "doctor";
	return "staff"; // Default to staff if unknown
};

const data = {
	navMain: [
		{
			title: "Hiến máu",
			url: "/staff/donation",
			icon: Cross,
			roles: ["doctor"], // Only for doctor
		},
		{
			title: "Chiến dịch hiến máu",
			url: "/staff/campaign",
			icon: FlagTriangleRight,
			roles: ["doctor"], // Only for doctor
		},
		{
			title: "Quản lý đơn vị máu",
			url: "/staff/bloodunitmanagement",
			icon: Droplet,
			roles: ["doctor"], // Only for doctor
		},
		{
			title: "Yêu cầu khẩn cấp",
			url: "/staff/emergency-request",
			icon: FileClock,
			roles: ["staff"], // Only for staff (replacing Lịch sử đơn vị máu)
		},
		{
			title: "Danh sách bài viết",
			url: "/staff/bloglist",
			icon: Newspaper,
			roles: ["staff"], // Only for staff
		},
		{
			title: "Lịch sử đơn vị máu",
			url: "/staff/bloodunithistory",
			icon: FileClock,
			roles: ["doctor"],
		},
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
};

function NavMain({ items }: { items: typeof data.navMain }) {
	const pathname = useLocation().pathname;

	return (
		<SidebarGroup>
			<SidebarGroupContent className="flex flex-col gap-2">
				<SidebarMenu>
					{items.map((item) => {
						const isActive = pathname.startsWith(item.url);

						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
									<Link to={item.url}>
										<item.icon />
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

export function StaffAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { userId } = useAuthContext();
	const subRole = getUserSubRole(userId);
	// Filter navMain items based on user sub-role
	const filteredNavMain = data.navMain.filter((item) => item.roles.includes(subRole));

	return (
		<Sidebar collapsible="icon" className="flex flex-col h-full" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
							<Link to={"#"}>
								<Cross className="h-5 w-5 text-red-500" />
								<span className="text-base font-semibold">BloodLink</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent className="flex-1">
				<NavMain items={filteredNavMain} />
			</SidebarContent>
			<SidebarFooter className="mt-auto">
				<StaffNavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
