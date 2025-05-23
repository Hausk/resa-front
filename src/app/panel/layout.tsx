'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // La vérification d'authentification est maintenant gérée par le middleware
  return (
    <SidebarProvider
      style={{
        '--sidebar-width': '8rem',
        '--sidebar-width-mobile': '8rem',
      }}
    >
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar className="hidden md:flex" variant="inset" />
        <main className="w-full">{children}</main>
      </div>
    </SidebarProvider>
  )
}
