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
			<StaffAppSidebar />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							<div className="px-4 lg:px-6">
								<Outlet />
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
