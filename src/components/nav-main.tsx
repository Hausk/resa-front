'use client'

import { type LucideIcon } from 'lucide-react'
import Link from 'next/link'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <div className="h-full w-full flex flex-col mt-6 gap-4">
      {items.map(item => (
        <div className="relative" key={item.title}>
          <Link href={item.url} className="sidebar-nav-item w-full">
            <div className="flex items-center flex-col relative p-4 mx-2 px-10 hover:bg-sidebar-accent hover:bg-sidebar-accent rounded-lg transition-all duration-200">
              {item.icon && (
                <item.icon className="sidebar-nav-icon w-8 h-8 mb-2 text-sidebar-foreground" />
              )}
              <span className="text-sm font-medium text-sidebar-foreground">
                {item.title}
              </span>
            </div>
          </Link>
          {item.isActive && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 bg-sidebar-primary h-[60%] w-[3px] rounded-full" />
          )}
        </div>
      ))}
    </div>
  )
}
