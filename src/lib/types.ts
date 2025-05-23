import { z } from 'zod'

// Types for desk and room data
export type BookingPeriod = 'morning' | 'afternoon' | 'full'

export interface BookingInfo {
  id: string
  date: string // Format ISO "YYYY-MM-DD"
  period: BookingPeriod
  userId: string
  userName: string
}

export interface Desk {
  id: string
  name: string
  x: number
  y: number
  type?: string
  description?: string
  features: string[]
  capacity?: number
  roomId?: string
  bookings?: BookingInfo[]
}

// Interface pour les salles
export interface Room {
  id: string
  name: string
  label?: string
  x: number
  y: number
  width: number
  height: number
  type: string
  capacity?: number
  description?: string
  color?: string
  position?: string
}

export interface User {
  id: string
  fullName: string
  email: string
  avatar?: string
}

const deskSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  x: z.number(),
  y: z.number(),
  type: z.string().min(1, 'Type is required'),
  description: z.string().optional(),
  roomId: z.string().min(1, 'Room is required'),
  features: z.array(z.string()).optional(),
})
// Type for the desk creation input
export type DeskCreationInput = z.infer<typeof deskSchema>

export interface ApiService {
  fetchDesksList: () => Promise<Desk[]>
  fetchRoomsList: () => Promise<Room[]>
  bookDesk: (deskId: string, date: Date, period: BookingPeriod) => Promise<any>
  isDeskAvailable: (
    deskId: string,
    date: Date,
    period: BookingPeriod,
  ) => Promise<boolean>
  getCurrentUser: () => Promise<User>
  getDeskBookings: (deskId: string) => Promise<BookingInfo[]>
  createNewDesk: (deskData: DeskCreationInput) => Promise<any>
}
