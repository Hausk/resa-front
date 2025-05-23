// src/components/app-sidebar.tsx
'use client'

import * as React from 'react'
import { CalendarDays, Building2, ShieldUser } from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { useUser } from '@/contexts/UserContext'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useUser()
  const pathname = usePathname()

  // This is sample data.
  const data = {
    navMain: [
      {
        title: 'Office',
        url: '/panel',
        icon: Building2,
        isActive: pathname == '/panel',
      },
      {
        title: 'Reservations',
        url: '/panel/bookings',
        icon: CalendarDays,
        isActive: pathname?.startsWith('/panel/bookings'),
      },
      {
        title: 'Admin',
        url: '/dashboard/admin',
        icon: ShieldUser,
        isActive: pathname?.startsWith('/dashboard/admin'),
      },
    ],
  }

  return (
    <Sidebar
      collapsible="offcanvas"
      className="bg-sidebar"
      variant="panel"
      {...props}
    >
      <SidebarHeader className="border-b border-sidebar-border/50">
        <div className="flex items-center justify-center py-4">
          <Image
            src="/ethifinance_monogram_rgb.png"
            alt="EthiFinance Logo"
            width={60}
            height={60}
            className="filter brightness-0 invert"
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar w-full p-0">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/50 bg-sidebar">
        {!loading && user && <NavUser />}
      </SidebarFooter>
    </Sidebar>
  )
}
