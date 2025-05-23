'use server'

import type {
  BookingInfo,
  BookingPeriod,
  Desk,
  DeskCreationInput,
  Room,
  User,
} from '@/lib/types'
import {
  bookDesk,
  createDesk,
  deleteDesk,
  fetchBookingsList,
  fetchDesksList,
  fetchRoomsList,
  getAuthToken,
  getCurrentUser,
  getDeskBookings,
  isDeskAvailable,
  updateDesk,
  userInformations,
} from './server-api-service'

// Actions serveur qui font le pont entre le client et l'API backend
// Ces fonctions sont marquées 'use server' et peuvent être importées et appelées depuis le client

export async function fetchDesks(): Promise<Desk[]> {
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Non authentifié')
    }
    return await fetchDesksList(token)
  } catch (error) {
    console.error(
      'Action serveur: Erreur lors de la récupération des bureaux:',
      error,
    )
    throw error
  }
}

export async function fetchRooms(): Promise<Room[]> {
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Non authentifié')
    }
    return await fetchRoomsList(token)
  } catch (error) {
    console.error(
      'Action serveur: Erreur lors de la récupération des salles:',
      error,
    )
    throw error
  }
}

export async function makeBooking(
  deskId: string,
  date: string,
  period: BookingPeriod,
): Promise<any> {
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Non authentifié')
    }
    return await bookDesk(token, deskId, date, period)
  } catch (error) {
    console.error(
      'Action serveur: Erreur lors de la réservation du bureau:',
      error,
    )
    throw error
  }
}

export async function checkDeskAvailability(
  deskId: string,
  date: string,
  period: BookingPeriod,
): Promise<boolean> {
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Non authentifié')
    }
    return await isDeskAvailable(token, deskId, date, period)
  } catch (error) {
    console.error(
      'Action serveur: Erreur lors de la vérification de disponibilité:',
      error,
    )
    // Par défaut, on considère que le bureau n'est pas disponible en cas d'erreur
    return false
  }
}

export async function getCurrentUserInfo(): Promise<any> {
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Non authentifié')
    }
    return await getCurrentUser(token)
  } catch (error) {
    console.error(
      'Action serveur: Erreur lors de la récupération des données utilisateur:',
      error,
    )
    throw error
  }
}

export async function getDeskBookingsList(
  deskId: string,
): Promise<BookingInfo[]> {
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Non authentifié')
    }
    return await getDeskBookings(token, deskId)
  } catch (error) {
    console.error(
      'Action serveur: Erreur lors de la récupération des réservations:',
      error,
    )
    return []
  }
}
export async function makeCreateDesk(data: DeskCreationInput): Promise<any> {
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Non authentifié')
    }
    return await createDesk(token, data)
  } catch (error) {
    console.error(
      'Action serveur: Erreur lors de la récupération des réservations:',
      error,
    )
    return []
  }
}

export async function makeUpdateDesk(data: Desk): Promise<any> {
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Non authentifié')
    }
    return await updateDesk(token, data)
  } catch (error) {
    console.error(
      'Action serveur: Erreur lors de la récupération des réservations:',
      error,
    )
    return []
  }
}

export async function makeDeleteDesk(deskId: string): Promise<any> {
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Non authentifié')
    }
    return await deleteDesk(token, deskId)
  } catch (error) {
    console.error(
      'Action serveur: Erreur lors de la récupération des réservations:',
      error,
    )
    return []
  }
}

export async function getUserInformations(): Promise<{
  id: string
  fullName: string
  email: string
  avatar: string
}> {
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Non authentifié')
    }
    return await userInformations(token)
  } catch (error) {
    console.error(
      'Action serveur: Erreur lors de la récupération des informations utilisateur:',
      error,
    )
    throw error
  }
}

export async function getBookingsList(userId: string): Promise<any> {
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('Non authentifié')
    }
    return await fetchBookingsList(token, userId)
  } catch (error) {
    console.error(
      'Action serveur: Erreur lors de la récupération des réservations:',
      error,
    )
    return []
  }
}
