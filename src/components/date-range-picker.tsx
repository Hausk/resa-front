'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { BookingPeriod } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface BookingDatePickerProps {
  className?: string
  selectedDate: Date
  onDateChange: (date: Date) => void
  bookingPeriod: BookingPeriod
  onPeriodChange: (period: BookingPeriod) => void
}

export function BookingDatePicker({
  className,
  selectedDate,
  onDateChange,
  bookingPeriod,
  onPeriodChange,
}: BookingDatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date)
      // Keep the popover open to allow period selection
    }
  }

  // Handle booking period selection and close popover
  const handlePeriodSelect = (value: string) => {
    onPeriodChange(value as BookingPeriod)
    // Optional: close the popover automatically after both selections
    setOpen(false)
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-picker"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              <span>
                {format(selectedDate, 'PPP')} -{' '}
                {bookingPeriod === 'morning'
                  ? 'Morning'
                  : bookingPeriod === 'afternoon'
                    ? 'Afternoon'
                    : 'Full Day'}
              </span>
            ) : (
              <span>Select date and period</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            initialFocus
          />
          <div className="p-3 border-t">
            <h4 className="mb-2 font-medium">Select period:</h4>
            <Select
              defaultValue={bookingPeriod}
              onValueChange={value =>
                handlePeriodSelect(value as BookingPeriod)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="full">Full Day</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
