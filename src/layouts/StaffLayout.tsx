import { Outlet } from 'react-router-dom'
import { StaffAppSidebar } from '@/components/sidebar/staff-app-sidebar'
import { SiteHeader } from '@/components/sidebar/site-header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

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
    )
}