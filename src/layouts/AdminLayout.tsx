import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/sidebar/app-sidebar' 
import { SiteHeader } from '@/components/sidebar/site-header' 
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function AdminLayout() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main>
          <Outlet /> 
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}