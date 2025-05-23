'use client'

import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Calendar,
  Clock,
  User,
  Check,
  Info,
  Building2,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import type { BookingPeriod, Desk } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { clientApiService } from '@/lib/client-api-service'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ModalReservationsProps {
  selectedDesk: Desk | null
  selectedDate: Date
  bookingDialogOpen: boolean
  setBookingDialogOpen: (open: boolean) => void
  isDeskAvailable: boolean
  bookingPeriod: BookingPeriod
  setBookingPeriod: (period: BookingPeriod) => void
  userFullName: string
  userEmail: string
  onDateChange: (date: Date) => void
}

export function ModalReservations({
  selectedDesk,
  selectedDate,
  bookingDialogOpen,
  setBookingDialogOpen,
  isDeskAvailable,
  bookingPeriod,
  setBookingPeriod,
  userFullName,
  userEmail,
  onDateChange,
}: ModalReservationsProps) {
  const [isBookingLoading, setIsBookingLoading] = useState(false)
  const [bookingUser, setBookingUser] = useState<string>('')
  const [bookingPeriodText, setBookingPeriodText] = useState<string>('')
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [localDate, setLocalDate] = useState<Date>(selectedDate)
  const [localAvailability, setLocalAvailability] =
    useState<boolean>(isDeskAvailable)
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  // Update local date when parent date changes
  useEffect(() => {
    setLocalDate(selectedDate)
  }, [selectedDate])

  // Update local availability when prop changes
  useEffect(() => {
    setLocalAvailability(isDeskAvailable)
  }, [isDeskAvailable])

  // Check availability when date or period changes locally
  useEffect(() => {
    const checkLocalAvailability = async () => {
      if (selectedDesk && localDate) {
        setCheckingAvailability(true)
        try {
          // Send date as string to avoid timezone issues
          const dateString = localDate.toISOString().split('T')[0]
          const isAvailable = await clientApiService.isDeskAvailable(
            selectedDesk.id,
            dateString,
            bookingPeriod,
          )
          setLocalAvailability(isAvailable)
        } catch (error) {
          console.error('Error checking availability:', error)
          setLocalAvailability(false)
        } finally {
          setCheckingAvailability(false)
        }
      }
    }

    checkLocalAvailability()
  }, [selectedDesk, localDate, bookingPeriod])

  // Get booking user info when desk is not available
  useEffect(() => {
    if (selectedDesk && !localAvailability && !checkingAvailability) {
      // Create a date string in YYYY-MM-DD format for consistent comparison
      const localDateString = localDate.toISOString().split('T')[0]

      const booking = selectedDesk.bookings?.find(booking => {
        // Ensure booking date is also in YYYY-MM-DD format for comparison
        const bookingDateString = booking.date.includes('T')
          ? booking.date.split('T')[0]
          : booking.date

        return (
          bookingDateString === localDateString &&
          (booking.period === bookingPeriod ||
            booking.period === 'full' ||
            bookingPeriod === 'full')
        )
      })

      if (booking) {
        setBookingUser(booking.userName || 'Utilisateur inconnu')

        switch (booking.period) {
          case 'morning':
            setBookingPeriodText('Matin (8:00 - 13:00)')
            break
          case 'afternoon':
            setBookingPeriodText('Après-midi (13:00 - 18:00)')
            break
          case 'full':
            setBookingPeriodText('Journée complète (8:00 - 18:00)')
            break
          default:
            setBookingPeriodText('')
        }
      } else {
        // If no booking found but desk is marked as unavailable,
        // it might be a data sync issue
        setBookingUser('Utilisateur inconnu')
        setBookingPeriodText('')
      }
    }
  }, [
    selectedDesk,
    localDate,
    bookingPeriod,
    localAvailability,
    checkingAvailability,
  ])

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Fix timezone issue - ensure we use the local date without timezone conversion
      const localDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      )
      setLocalDate(localDate)
      onDateChange(localDate) // Update parent component
      setDatePickerOpen(false)
    }
  }

  const handleBookDesk = async () => {
    if (!selectedDesk) return

    setIsBookingLoading(true)
    try {
      // Ensure we send the date in YYYY-MM-DD format to avoid timezone issues
      const dateString = localDate.toISOString().split('T')[0]
      await clientApiService.bookDesk(
        selectedDesk.id,
        dateString,
        bookingPeriod,
      )

      // Emit event to refresh desk data
      window.dispatchEvent(new CustomEvent('reservation-updated'))

      toast.success('Réservation confirmée', {
        description: `Vous avez réservé ${selectedDesk.name} pour ${
          bookingPeriod === 'full'
            ? 'la journée complète'
            : bookingPeriod === 'morning'
              ? 'le matin'
              : "l'après-midi"
        } le ${format(localDate, 'dd/MM/yyyy')}`,
      })

      setBookingDialogOpen(false)
    } catch (err) {
      console.error('Error booking desk:', err)
      toast.error('Échec de la réservation', {
        description:
          'Une erreur est survenue lors de la réservation. Veuillez réessayer.',
      })
    } finally {
      setIsBookingLoading(false)
    }
  }

  const getPeriodText = (period: BookingPeriod): string => {
    switch (period) {
      case 'morning':
        return 'Matin (8:00 - 13:00)'
      case 'afternoon':
        return 'Après-midi (13:00 - 18:00)'
      case 'full':
        return 'Journée complète (8:00 - 18:00)'
      default:
        return ''
    }
  }

  return (
    <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0">
        <div className="bg-primary text-primary-foreground p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Building2 className="h-5 w-5" />
              {selectedDesk?.name}
              <Badge
                className={cn(
                  checkingAvailability
                    ? 'bg-muted text-muted-foreground'
                    : localAvailability
                      ? 'bg-secondary text-primary'
                      : 'bg-destructive text-destructive-foreground',
                )}
              >
                {checkingAvailability
                  ? 'Vérification...'
                  : localAvailability
                    ? 'Disponible'
                    : `Réservé par ${bookingUser}`}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              {selectedDesk?.description || 'Réservation de bureau'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2 mt-4">
            {selectedDesk?.features.map((feature, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-secondary text-primary"
              >
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Booking details */}
          <div className="space-y-4">
            {/* Date picker */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <Label className="font-medium">Date de réservation</Label>
              </div>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal bg-card',
                      !localDate && 'text-muted-foreground',
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {localDate
                      ? format(localDate, 'dd MMMM yyyy')
                      : 'Sélectionner une date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={localDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    disabled={date =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {localAvailability ? (
              <>
                {/* Period selection */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <Label className="font-medium">Période</Label>
                  </div>
                  <Select
                    value={bookingPeriod}
                    onValueChange={value =>
                      setBookingPeriod(value as BookingPeriod)
                    }
                  >
                    <SelectTrigger className="w-full bg-card">
                      <SelectValue placeholder="Sélectionner une période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="morning">
                          Matin (8:00 - 13:00)
                        </SelectItem>
                        <SelectItem value="afternoon">
                          Après-midi (13:00 - 18:00)
                        </SelectItem>
                        <SelectItem value="full">
                          Journée complète (8:00 - 18:00)
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* User info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <Label>Booked for</Label>
                  </div>
                  <Card className="p-2 border rounded-md gap-0">
                    {userFullName || 'Not specified'}
                    {userEmail && (
                      <div className="text-xs text-muted-foreground mt-0">
                        {userEmail}
                      </div>
                    )}
                  </Card>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <Label className="font-medium">Période demandée</Label>
                  </div>
                  <Card className="p-2 border rounded-md gap-0">
                    {getPeriodText(bookingPeriod)}
                  </Card>
                </div>

                <div className="rounded-md bg-muted/50 p-3 border-l-4 border-accent flex gap-3">
                  <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    Ce bureau est déjà réservé pour la période sélectionnée.
                    Veuillez choisir une autre date ou période.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <DialogFooter className="p-4 flex justify-between sm:justify-between">
          <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
            Annuler
          </Button>
          {localAvailability && (
            <Button
              onClick={handleBookDesk}
              disabled={
                isBookingLoading ||
                checkingAvailability ||
                !userFullName ||
                !userEmail
              }
              className="gap-2 bg-accent hover:bg-accent/90 text-white"
            >
              {isBookingLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Réservation en cours...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Confirmer la réservation
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
