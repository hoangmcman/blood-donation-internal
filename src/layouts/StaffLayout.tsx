import { Outlet } from "react-router-dom";

import { SiteHeader } from "@/components/sidebar/site-header";
import { StaffAppSidebar } from "@/components/sidebar/staff-app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function StaffLayout() {
	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<StaffAppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<main>
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
