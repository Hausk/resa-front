'use client'
import { redirect } from 'next/navigation'
import { QuickReservation } from '@/components/quick-reservation'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { BookingDatePicker } from '@/components/date-range-picker'
import { useState } from 'react'
import { BookingPeriod } from '@/lib/types'
import dynamic from 'next/dynamic'
const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
  ssr: false,
})
// This would normally check the session server-side
const isAuthenticated = true

export default function DashboardPage() {
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    redirect('/login')
  }
  // 👉 Ici on gère la date et la période globalement
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [bookingPeriod, setBookingPeriod] = useState<BookingPeriod>('full')

  return (
    <>
      <SidebarInset className="h-screen w-full overflow-hidden">
        <header className="px-6flex h-auto my-2 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <div className="space-y-2 px-8 block md:flex md:justify-between w-full">
              <h2 className="text-3xl font-bold tracking-tight">
                Siege Haussmann
              </h2>
              <div className="flex items-center space-x-2 justify-between">
                <QuickReservation />
                <BookingDatePicker
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  bookingPeriod={bookingPeriod}
                  onPeriodChange={setBookingPeriod}
                />
              </div>
            </div>
          </div>
        </header>

        <div className="flex h-screen flex-col z-0">
          <InteractiveMap
            selectedDate={selectedDate}
            bookingPeriod={bookingPeriod}
            onDateChange={setSelectedDate}
            onPeriodChange={setBookingPeriod}
          />
        </div>
      </SidebarInset>
    </>
  )
}
