'use server'
import type {
  BookingInfo,
  BookingPeriod,
  Desk,
  DeskCreationInput,
  Room,
} from '@/lib/types'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Récupérer le token d'authentification depuis les cookies
export async function getAuthToken(): Promise<string | undefined> {
  return (await cookies()).get('auth_token')?.value
}

// Récupérer les bureaux depuis l'API
export async function fetchDesksList(token: string): Promise<Desk[]> {
  try {
    const response = await fetch('http://localhost:3333/api/desks', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur de récupération des bureaux: ${response.status}`)
    }

    const desks = await response.json()

    // Transformer les réservations pour chaque bureau
    return desks.map((desk: any) => ({
      ...desk,
      features: desk.features?.map((f: any) => f.name) || [],
      bookings:
        desk.reservations?.map((reservation: any) => ({
          id: reservation.id,
          date: reservation.date,
          period: reservation.period,
          userId: reservation.userId,
          userName: reservation.user?.fullName || 'Utilisateur',
        })) || [],
    }))
  } catch (error) {
    console.error('Erreur lors de la récupération des bureaux:', error)
    throw error
  }
}

// Récupérer les salles depuis l'API
export async function fetchRoomsList(token: string): Promise<Room[]> {
  try {
    const response = await fetch('http://localhost:3333/api/rooms', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Erreur de récupération des salles: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la récupération des salles:', error)
    throw error
  }
}

// Réserver un bureau
export async function bookDesk(
  token: string,
  deskId: string,
  date: string,
  period: BookingPeriod,
): Promise<any> {
  try {
    const response = await fetch('http://localhost:3333/api/bookings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deskId,
        date: date, // Format YYYY-MM-DD
        period,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || 'Échec lors de la réservation du bureau')
    }

    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la réservation du bureau:', error)
    throw error
  }
}

// Vérifier si un bureau est disponible
export async function isDeskAvailable(
  token: string,
  deskId: string,
  date: string,
  period: BookingPeriod,
): Promise<boolean> {
  try {
    const formattedDate = date // Format YYYY-MM-DD
    console.log(formattedDate)
    const response = await fetch(
      `http://localhost:3333/api/desks/${deskId}/availability?date=${formattedDate}&period=${period}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la vérification de disponibilité: ${response.status}`,
      )
    }

    const data = await response.json()
    return data.available
  } catch (error) {
    console.error('Erreur lors de la vérification de disponibilité:', error)
    // En cas d'erreur, on considère que le bureau n'est pas disponible par sécurité
    return false
  }
}

// Récupérer l'utilisateur actuel
export async function getCurrentUser(token: string): Promise<any> {
  try {
    const response = await fetch('http://localhost:3333/api/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération des données utilisateur: ${response.status}`,
      )
    }

    return await response.json()
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des données utilisateur:',
      error,
    )
    throw error
  }
}

// Récupérer les réservations d'un bureau
export async function getDeskBookings(
  token: string,
  deskId: string,
): Promise<BookingInfo[]> {
  try {
    const response = await fetch(`/api/desks/${deskId}/bookings`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération des réservations: ${response.status}`,
      )
    }

    const bookings = await response.json()

    return bookings.map((booking: any) => ({
      id: booking.id,
      date: booking.date,
      period: booking.period,
      userId: booking.userId,
      userName: booking.user?.fullName || 'Utilisateur',
    }))
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error)
    return []
  }
}

/**
 * Server action to create a new desk
 */
export async function createDesk(token: string, data: DeskCreationInput) {
  try {
    // Validate the input data
    if (!token) {
      throw new Error('Non authentifié')
    }
    console.log(data)

    // Make API request to create the desk
    const response = await fetch('http://localhost:3333/api/desk', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to create desk')
    }

    // Revalidate the desks page to show the new desk
    revalidatePath('/dashboard/desk-management')

    return { success: true }
  } catch (error) {
    if (error) {
      return { success: false, errors: error }
    }
    throw error
  }
}

export async function updateDesk(token: string, data: Desk) {
  try {
    // Validate the input data
    if (!token) {
      throw new Error('Non authentifié')
    }

    // Make API request to create the desk
    const response = await fetch(`http://localhost:3333/api/desk/${data.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to update desk')
    }
    return { success: true }
  } catch (error) {
    if (error) {
      return { success: false, errors: error }
    }
    throw error
  }
}

export async function deleteDesk(token: string, id: string) {
  try {
    // Validate the input data
    if (!token) {
      throw new Error('Non authentifié')
    }

    // Make API request to create the desk
    const response = await fetch(`http://localhost:3333/api/desk/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to delete desk')
    }
    return { success: true }
  } catch (error) {
    if (error) {
      return { success: false, errors: error }
    }
    throw error
  }
}

export async function userInformations(token: string) {
  try {
    // Validate the input data
    if (!token) {
      throw new Error('Non authentifié')
    }

    // Make API request to create the desk
    const response = await fetch(`http://localhost:3333/api/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 120 },
    })

    console.log(response)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to get user')
    }
    return await response.json()
  } catch (error) {
    if (error) {
      return { success: false, errors: error }
    }
    throw error
  }
}

export async function fetchBookingsList(
  token: string,
  userId: string,
): Promise<Room[]> {
  try {
    const response = await fetch(
      `http://localhost:3333/api/bookings/${userId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Erreur de récupération des salles: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la récupération des salles:', error)
    throw error
  }
}
