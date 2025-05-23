import PastBookingsTable from '@/components/bookings/past-bookings-table'
import UpcomingBookingsTable from '@/components/bookings/upcoming-bookings-table'
import { Card } from '@/components/ui/card'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarDays, History } from 'lucide-react'

export default function BookingsPage() {
  return (
    <SidebarInset className="h-screen w-full overflow-hidden px-6">
      <header className="flex h-auto my-4 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1" />
          <div className="space-y-2 px-8 block md:flex md:justify-between w-full">
            <h2 className="text-3xl font-bold tracking-tight text-primary">
              Réservations
            </h2>
          </div>
        </div>
      </header>
      <div className="flex flex-col z-0 pb-8">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>Actuelles & Futures</span>
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Annulées & Passées</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <Card className="shadow-sm">
              <UpcomingBookingsTable />
            </Card>
          </TabsContent>
          <TabsContent value="past">
            <Card className="shadow-sm">
              <PastBookingsTable />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
