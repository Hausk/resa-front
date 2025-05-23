// lib/clientApiService.ts
import type { BookingInfo, BookingPeriod, Desk, Room } from '@/lib/types'
import {
  fetchDesks,
  fetchRooms,
  makeBooking,
  checkDeskAvailability,
  getCurrentUserInfo,
  getDeskBookingsList,
} from '@/lib/server-actions'

// Service API côté client qui utilise les server actions
export const clientApiService = {
  // Récupérer les bureaux
  async fetchDesksList(): Promise<Desk[]> {
    try {
      return await fetchDesks()
    } catch (error) {
      console.error(
        'Client API: Erreur lors de la récupération des bureaux:',
        error,
      )
      throw error
    }
  },

  // Récupérer les salles
  async fetchRoomsList(): Promise<Room[]> {
    try {
      return await fetchRooms()
    } catch (error) {
      console.error(
        'Client API: Erreur lors de la récupération des salles:',
        error,
      )
      throw error
    }
  },

  // Réserver un bureau
  async bookDesk(
    deskId: string,
    date: string,
    period: BookingPeriod,
  ): Promise<any> {
    try {
      return await makeBooking(deskId, date, period)
    } catch (error) {
      console.error(
        'Client API: Erreur lors de la réservation du bureau:',
        error,
      )
      throw error
    }
  },

  // Vérifier si un bureau est disponible
  async isDeskAvailable(
    deskId: string,
    date: string,
    period: BookingPeriod,
  ): Promise<boolean> {
    try {
      return await checkDeskAvailability(deskId, date, period)
    } catch (error) {
      console.error(
        'Client API: Erreur lors de la vérification de disponibilité:',
        error,
      )
      // Par défaut, on considère que le bureau n'est pas disponible en cas d'erreur
      return false
    }
  },

  // Récupérer l'utilisateur actuel
  async getCurrentUser(): Promise<any> {
    try {
      return await getCurrentUserInfo()
    } catch (error) {
      console.error(
        'Client API: Erreur lors de la récupération des données utilisateur:',
        error,
      )
      throw error
    }
  },

  // Récupérer les réservations d'un bureau
  async getDeskBookings(deskId: string): Promise<BookingInfo[]> {
    try {
      return await getDeskBookingsList(deskId)
    } catch (error) {
      console.error(
        'Client API: Erreur lors de la récupération des réservations:',
        error,
      )
      return []
    }
  },
  // Récupérer l'utilisateur actuel
  async getUserInformations(): Promise<any> {
    try {
      return await getCurrentUserInfo()
    } catch (error) {
      console.error(
        'Client API: Erreur lors de la récupération des données utilisateur:',
        error,
      )
      throw error
    }
  },
}
