'use client'

import { MapContainer, ImageOverlay, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import type { Desk, Room, BookingPeriod, User } from '@/lib/types'
import { clientApiService } from '@/lib/client-api-service'
import { ModalReservations } from './bookings/modal-reservations'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Types and Services
import type {} from '@/lib/types'

// Custom Components
import {} from './bookings/modal-reservations'
import {} from '@/lib/client-api-service'

// Leaflet imports
import { useMapEvents } from 'react-leaflet'
import {} from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface InteractiveMapProps {
  selectedDate: Date
  bookingPeriod: BookingPeriod
  onDateChange: (date: Date) => void
  onPeriodChange: (period: BookingPeriod) => void
}

// Custom marker component for desks
const DeskMarker = ({
  desk,
  isAvailable,
  onClick,
}: {
  desk: Desk
  isAvailable: boolean
  onClick: () => void
}) => {
  const map = useMap()
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!markerRef.current) {
      // Create a custom icon for the desk
      const icon = L.divIcon({
        className: 'desk-marker',
        html: `<div class="${
          isAvailable ? 'bg-emerald-500' : 'bg-red-500'
        } w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transform hover:scale-110 transition-transform border-2 border-white">
          <span class="text-white text-xs font-bold select-none">${desk.name.split(' ')[1]}</span>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      // Create the marker
      const marker = L.marker([desk.y, desk.x], { icon })
      marker.on('click', onClick)
      marker.addTo(map)
      markerRef.current = marker
    } else {
      // Update the icon if availability changes
      const icon = L.divIcon({
        className: 'desk-marker',
        html: `<div class="${
          isAvailable ? 'bg-emerald-500' : 'bg-red-500'
        } w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transform hover:scale-110 transition-transform border-2 border-white">
          <span class="text-white text-xs font-bold select-none">${desk.name.split(' ')[1]}</span>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })
      markerRef.current.setIcon(icon)
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }
  }, [map, desk, isAvailable, onClick])

  return null
}

// Custom component for room overlays
const RoomOverlay = ({
  room,
  showZones,
  getRoomColor,
}: {
  room: Room
  showZones: boolean
  getRoomColor: (room: Room) => string
}) => {
  const map = useMap()
  const rectangleRef = useRef<L.Rectangle | null>(null)

  useEffect(() => {
    if (!rectangleRef.current) {
      // Create rectangle for room
      const bounds = L.latLngBounds(
        [room.y, room.x],
        [room.y + room.height, room.x + room.width],
      )

      const rectangle = L.rectangle(bounds, {
        color: showZones ? getRoomColor(room) : 'transparent',
        weight: 8,
        fill: false,
        interactive: false,
      })

      // Add room name label
      const center = bounds.getCenter()
      const label = L.marker(center, {
        icon: L.divIcon({
          className: 'room-label',
          html: `<div class="${cn(
            'bg-white text-foreground px-2 py-0.5 rounded text-md font-bold select-none pointer-events-none',
            room.position ?? 'top-0',
          )}">${room.name}${room.capacity ? ` <span class="ml-1 text-muted-foreground">(${room.capacity})</span>` : ''}</div>`,
          iconSize: [100, 20],
          iconAnchor: [50, 10],
        }),
        interactive: false,
      })

      rectangle.addTo(map)
      label.addTo(map)
      rectangleRef.current = rectangle
    } else {
      // Update rectangle style if showZones changes
      rectangleRef.current.setStyle({
        color: showZones ? getRoomColor(room) : 'transparent',
      })
    }

    return () => {
      if (rectangleRef.current) {
        rectangleRef.current.remove()
        rectangleRef.current = null
      }
    }
  }, [map, room, showZones, getRoomColor])

  return null
}

// Map event handler component
const MapEventHandler = ({
  onZoomChange,
}: {
  onZoomChange: (zoom: number) => void
}) => {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom())
    },
  })

  return null
}

export default function InteractiveMap({
  selectedDate,
  bookingPeriod,
  onDateChange,
  onPeriodChange,
}: InteractiveMapProps) {
  const [desksList, setDesksList] = useState<Desk[]>([])
  const [roomsList, setRoomsList] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null)
  const [isDeskAvailable, setIsDeskAvailable] = useState(true)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [showZones, setShowZones] = useState(true)

  const imageWidth = 1000
  const imageHeight = 1500

  const bounds = useMemo(
    () =>
      [
        [0, 0],
        [imageHeight, imageWidth],
      ] as L.LatLngBoundsExpression,
    [],
  )

  // Calculate desk availability for all desks
  const deskAvailabilityMap = useMemo(() => {
    const availabilityMap = new Map<string, boolean>()
    const selectedDateString = selectedDate.toISOString().split('T')[0]

    desksList.forEach(desk => {
      let isAvailable = true

      if (desk.bookings && desk.bookings.length > 0) {
        const bookingsOnDate = desk.bookings.filter(booking => {
          const bookingDateString = booking.date.includes('T')
            ? booking.date.split('T')[0]
            : booking.date
          return bookingDateString === selectedDateString
        })

        for (const booking of bookingsOnDate) {
          if (booking.period === 'full') {
            isAvailable = false
            break
          }
          if (bookingPeriod === 'full') {
            isAvailable = false
            break
          }
          if (bookingPeriod === 'morning' && booking.period === 'morning') {
            isAvailable = false
            break
          }
          if (bookingPeriod === 'afternoon' && booking.period === 'afternoon') {
            isAvailable = false
            break
          }
        }
      }

      availabilityMap.set(desk.id, isAvailable)
    })

    return availabilityMap
  }, [desksList, selectedDate, bookingPeriod])

  // Helper function to get room color
  const getRoomColor = useCallback((room: Room): string => {
    if (room.color) return room.color

    const roomColors = {
      meeting: '#ffcccc',
      workspace: '#cce6ff',
      lounge: '#ccffcc',
      bathroom: '#e6ccff',
      conference: '#ffcc99',
      private: '#e6e6e6',
      kitchen: '#d9f2e6',
    }

    return roomColors[room.type as keyof typeof roomColors] || '#f2f2f2'
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [desks, rooms, user] = await Promise.all([
          clientApiService.fetchDesksList(),
          clientApiService.fetchRoomsList(),
          clientApiService.getCurrentUser(),
        ])
        setDesksList(desks)
        setRoomsList(rooms)
        setCurrentUser(user)
      } catch (err) {
        console.error('Error loading data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Listen for reservation updates
  useEffect(() => {
    const handleReservationUpdate = async () => {
      try {
        const updatedDesksList = await clientApiService.fetchDesksList()
        setDesksList(updatedDesksList)
      } catch (error) {
        console.error('Error refreshing desks data:', error)
      }
    }

    window.addEventListener('reservation-updated', handleReservationUpdate)
    return () => {
      window.removeEventListener('reservation-updated', handleReservationUpdate)
    }
  }, [])

  const handleDeskClick = async (desk: Desk) => {
    setSelectedDesk(desk)
    const dateString = selectedDate.toISOString().split('T')[0]
    try {
      const available = await clientApiService.isDeskAvailable(
        desk.id,
        dateString,
        bookingPeriod,
      )
      setIsDeskAvailable(available)
    } catch (e) {
      setIsDeskAvailable(false)
    }
    setBookingDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading office map data...</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer
        bounds={bounds}
        maxBounds={bounds}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        minZoom={-1}
        zoom={0}
        maxZoom={2}
        center={[imageHeight / 8, imageWidth / 2]}
        crs={L.CRS.Simple}
      >
        <ImageOverlay url="/map.png" bounds={bounds} />

        {/* Room overlays */}
        {roomsList.map(room => (
          <RoomOverlay
            key={room.id}
            room={room}
            showZones={showZones}
            getRoomColor={getRoomColor}
          />
        ))}

        {/* Desk markers */}
        {desksList.map(desk => (
          <DeskMarker
            key={desk.id}
            desk={desk}
            isAvailable={deskAvailabilityMap.get(desk.id) || false}
            onClick={() => handleDeskClick(desk)}
          />
        ))}
      </MapContainer>

      {/* Room toggle */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowZones(!showZones)}
          className="bg-white/80 shadow-md"
        >
          {showZones ? 'Hide rooms border' : 'Show rooms borders'}
        </Button>
      </div>

      <ModalReservations
        bookingDialogOpen={bookingDialogOpen}
        setBookingDialogOpen={setBookingDialogOpen}
        isDeskAvailable={isDeskAvailable}
        selectedDate={selectedDate}
        selectedDesk={selectedDesk}
        bookingPeriod={bookingPeriod}
        setBookingPeriod={onPeriodChange}
        userFullName={currentUser?.fullName || ''}
        userEmail={currentUser?.email || ''}
        onDateChange={onDateChange}
      />
    </div>
  )
}
