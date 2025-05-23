'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MapContainer, ImageOverlay, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Desk, Room, User } from '@/lib/types'
import { clientApiService } from '@/lib/client-api-service'
import { DeskFormModal } from './desk-form-modal'

interface DeskCreationMapProps {
  isCreatingDesk: boolean
  onDeskCreated: () => void
  onReservationValidated?: () => void
}

// Map click handler component
const MapClickHandler = ({
  isCreatingDesk,
  onMapClick,
}: {
  isCreatingDesk: boolean
  onMapClick: (x: number, y: number) => void
}) => {
  useMapEvents({
    click: e => {
      if (isCreatingDesk) {
        const { lat, lng } = e.latlng
        onMapClick(Math.round(lng), Math.round(lat))
      }
    },
  })

  return null
}

export function DeskCreationMap({
  isCreatingDesk,
  onDeskCreated,
  onReservationValidated,
}: DeskCreationMapProps) {
  const [desksList, setDesksList] = useState<Desk[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [roomsList, setRoomsList] = useState<Room[]>([])
  const [clickedPosition, setClickedPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDeskId, setSelectedDeskId] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  const fetchData = useCallback(async () => {
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
      toast.error('Failed to load map data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const imageWidth = 1000
  const imageHeight = 1500

  const bounds = [
    [0, 0],
    [imageHeight, imageWidth],
  ] as L.LatLngBoundsExpression

  // Handle map click
  const handleMapClick = useCallback(
    (x: number, y: number) => {
      if (isCreatingDesk) {
        setClickedPosition({ x, y })
        setIsModalOpen(true)
        setIsEditMode(false)
        setSelectedDeskId(null)
      }
    },
    [isCreatingDesk],
  )

  // Handle desk marker click
  const handleDeskClick = useCallback(
    (deskId: string) => {
      const desk = desksList.find(d => d.id === deskId)
      if (!desk) return

      setClickedPosition({ x: desk.x, y: desk.y })
      setSelectedDeskId(deskId)
      setIsEditMode(true)
      setIsModalOpen(true)
    },
    [desksList],
  )

  // Handle desk creation/update success
  const handleDeskCreated = useCallback(() => {
    setIsModalOpen(false)
    setClickedPosition(null)
    setSelectedDeskId(null)
    setIsEditMode(false)
    fetchData() // Refresh data after desk creation
    onDeskCreated()
  }, [onDeskCreated, fetchData])

  // Handle desk deletion
  const handleDeskDeleted = useCallback(() => {
    setIsModalOpen(false)
    setClickedPosition(null)
    setSelectedDeskId(null)
    setIsEditMode(false)
    fetchData() // Refresh data after desk deletion
    toast.success('Desk deleted successfully')
  }, [fetchData])

  // Handle reservation validation
  const handleReservationValidated = useCallback(() => {
    fetchData() // Refresh data after reservation validation
    if (onReservationValidated) {
      onReservationValidated()
    }
  }, [fetchData, onReservationValidated])

  // Handle marker drag end
  const handleMarkerDragEnd = useCallback(
    (deskId: string, x: number, y: number) => {
      // Find the desk that was dragged
      const desk = desksList.find(d => d.id === deskId)
      if (!desk) return

      // Update the desk position
      setClickedPosition({ x, y })
      setSelectedDeskId(deskId)
      setIsEditMode(true)
      setIsModalOpen(true)

      toast.info('Position updated. Save changes to confirm the new position.')
    },
    [desksList],
  )

  // Get selected desk data
  const selectedDesk = selectedDeskId
    ? desksList.find(desk => desk.id === selectedDeskId)
    : null

  // Desk marker component with dragging capability
  const DeskMarker = ({ desk, index }: { desk: Desk; index: number }) => {
    const map = useMap()
    const markerRef = useRef<L.Marker | null>(null)

    useEffect(() => {
      if (!markerRef.current) {
        // Create a custom icon for the desk
        const icon = L.divIcon({
          className: 'desk-marker',
          html: `<div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center cursor-pointer transform hover:scale-110 transition-transform border-2 border-white shadow-md">
            <span class="text-white text-xs font-bold select-none">${desk.name.split(' ')[1]}</span>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        // Create the marker with draggable option
        const marker = L.marker([desk.y, desk.x], {
          icon,
          draggable: true, // Make marker draggable
        })

        // Add drag end event handler
        marker.on('dragend', () => {
          const position = marker.getLatLng()
          handleMarkerDragEnd(
            desk.id,
            Math.round(position.lng),
            Math.round(position.lat),
          )
        })

        // Add click handler
        marker.on('click', () => {
          handleDeskClick(desk.id)
        })

        marker.addTo(map)
        markerRef.current = marker

        // Add tooltip with desk name
        marker.bindTooltip(desk.name, {
          permanent: false,
          direction: 'top',
          className:
            'bg-white px-2 py-1 rounded shadow-md border border-gray-200 text-sm',
        })
      }

      return () => {
        if (markerRef.current) {
          markerRef.current.remove()
          markerRef.current = null
        }
      }
    }, [map, desk, index])

    return null
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] border rounded-lg bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading map data...</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border shadow-sm">
      <MapContainer
        bounds={bounds}
        maxBounds={bounds}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        zoom={-1}
        minZoom={-2}
        maxZoom={2}
        crs={L.CRS.Simple}
        className="bg-slate-50"
      >
        <ImageOverlay url="/map.png" bounds={bounds} />

        {/* Render desk markers */}
        {desksList.map((desk, index) => (
          <DeskMarker key={desk.id} desk={desk} index={index} />
        ))}

        {/* Map click handler */}
        <MapClickHandler
          isCreatingDesk={isCreatingDesk}
          onMapClick={handleMapClick}
        />
      </MapContainer>

      {/* Desk creation/edit modal */}
      <DeskFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setClickedPosition(null)
          setSelectedDeskId(null)
          setIsEditMode(false)
        }}
        position={clickedPosition}
        rooms={roomsList}
        onDeskCreated={handleDeskCreated}
        onDeskDeleted={handleDeskDeleted}
        isEditMode={isEditMode}
        deskData={selectedDesk}
      />

      {/* Creation mode indicator */}
      {isCreatingDesk && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 p-3 rounded-lg shadow-lg border border-primary">
          <p className="text-sm font-medium text-primary">
            Click anywhere on the map to place a desk
          </p>
        </div>
      )}

      {/* Interaction instructions */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 p-3 rounded-lg shadow-lg border border-slate-200">
        <ul className="text-sm font-medium text-slate-700 space-y-1">
          <li>
            <span className="font-bold">Click</span> on a desk to edit it
          </li>
          <li>
            <span className="font-bold">Drag</span> a desk to reposition it
          </li>
          {isCreatingDesk && (
            <li>
              <span className="font-bold">Click</span> on the map to add a new
              desk
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
