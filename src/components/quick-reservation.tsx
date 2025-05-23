'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CalendarDays, Zap, Building2, Clock, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// Define booking period type
type BookingPeriod = 'morning' | 'afternoon' | 'full'

export function QuickReservation() {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [bookingPeriod, setBookingPeriod] = useState<BookingPeriod>('full')
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickBook = async () => {
    setIsLoading(true)

    // Simulate finding an available desk
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simulate successful booking
    const randomDeskNumber = Math.floor(Math.random() * 30) + 1

    toast.success('Réservation rapide confirmée', {
      description: `Vous avez réservé le Bureau ${randomDeskNumber} pour ${
        bookingPeriod === 'full'
          ? 'la journée complète'
          : bookingPeriod === 'morning'
            ? 'le matin'
            : "l'après-midi"
      } le ${format(date, 'dd MMMM yyyy', { locale: fr })}`,
    })

    setIsLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-accent hover:bg-accent/90 text-white"
        >
          <Zap className="md:mr-2 h-4 w-4" />
          <span className="hidden md:inline">Réservation rapide</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <div className="bg-primary text-primary-foreground p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Zap className="h-5 w-5" />
              Réservation rapide
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              Sélectionnez une date et une période pour réserver rapidement le
              premier bureau disponible.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <Label className="font-medium">Date de réservation</Label>
            </div>
            <Card className="border border-border">
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={date => date && setDate(date)}
                  className="rounded-md"
                  locale={fr}
                  disabled={date =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <Label className="font-medium">Période de réservation</Label>
            </div>
            <Card className="border border-border">
              <CardContent className="p-4">
                <RadioGroup
                  value={bookingPeriod}
                  onValueChange={value =>
                    setBookingPeriod(value as BookingPeriod)
                  }
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem
                      value="morning"
                      id="quick-morning"
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="quick-morning" className="font-medium">
                        Matin
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        8:00 - 13:00
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem
                      value="afternoon"
                      id="quick-afternoon"
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="quick-afternoon" className="font-medium">
                        Après-midi
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        13:00 - 18:00
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem
                      value="full"
                      id="quick-full"
                      className="mt-1"
                    />
                    <div>
                      <Label htmlFor="quick-full" className="font-medium">
                        Journée complète
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        8:00 - 18:00
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <DialogFooter className="p-4 flex justify-between sm:justify-between">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleQuickBook}
            disabled={isLoading}
            className="gap-2 bg-accent hover:bg-accent/90 text-white"
          >
            {isLoading ? (
              <>
                <Search className="h-4 w-4 animate-spin" />
                Recherche en cours...
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                Réserver
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
