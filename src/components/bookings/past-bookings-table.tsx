'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, Clock, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { getBookingsList, getUserInformations } from '@/lib/server-actions'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Booking {
  id: string
  date: string
  period: 'morning' | 'afternoon' | 'full'
  status: 'canceled' | 'completed'
  user: {
    avatar?: string
    fullName: string
    email: string
  }
  desk: {
    name: string
  }
  team: string
}

async function fetchPastBookings(): Promise<Booking[]> {
  const userInformations = await getUserInformations()
  const data = await getBookingsList(userInformations?.id, true)

  // Exemple de données pour les réservations passées/annulées
  const pastBookings = [
    {
      id: 'past-1',
      date: '2025-05-10',
      period: 'full',
      status: 'completed',
      desk: { name: 'Bureau A12' },
      team: 'esg-ratings',
    },
    {
      id: 'past-2',
      date: '2025-05-05',
      period: 'morning',
      status: 'canceled',
      desk: { name: 'Bureau B08' },
      team: 'esg-ratings',
    },
    {
      id: 'past-3',
      date: '2025-04-28',
      period: 'afternoon',
      status: 'completed',
      desk: { name: 'Bureau C15' },
      team: 'esg-ratings',
    },
  ]

  // Simuler les données passées
  return pastBookings.map((item: any) => ({
    ...item,
    user: {
      avatar: userInformations.avatar,
      fullName: userInformations.fullName,
      email: userInformations.email,
    },
  }))
}

// Helper function to get time range based on period
function getTimeRange(period: 'morning' | 'afternoon' | 'full'): string {
  switch (period) {
    case 'full':
      return '08:00 - 18:00'
    case 'morning':
      return '08:00 - 13:00'
    case 'afternoon':
      return '13:00 - 18:00'
    default:
      return ''
  }
}

export default function PastBookingsTable() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetchPastBookings()
      .then(setBookings)
      .finally(() => setIsLoading(false))
  }, [])

  const filteredData = bookings.filter(item => {
    if (!date) return true
    return (
      format(new Date(item.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    )
  })

  return (
    <>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-primary">
          Réservations passées & annulées
        </CardTitle>
        <div className="relative max-w-xs mt-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : 'Filtrer par date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {date && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setDate(undefined)}
            >
              Effacer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Date & Heure</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Bureau</TableHead>
                <TableHead>Équipe</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Chargement des réservations...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Aucune réservation trouvée.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map(res => (
                  <TableRow key={res.id} className="group">
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-medium">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(res.date), 'dd MMM yyyy')}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          {getTimeRange(res.period as any)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border">
                          <AvatarImage
                            src={res.user.avatar || '/placeholder.svg'}
                            alt={res.user.fullName}
                          />
                          <AvatarFallback className="text-xs bg-secondary text-primary">
                            {res.user.fullName
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{res.user.fullName}</div>
                          <div className="text-xs text-muted-foreground">
                            {res.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {res.desk.name}
                    </TableCell>
                    <TableCell>{res.team}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          res.status === 'completed'
                            ? 'bg-secondary text-primary'
                            : 'bg-destructive text-destructive-foreground',
                        )}
                      >
                        {res.status === 'completed' ? 'Terminée' : 'Annulée'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </>
  )
}
