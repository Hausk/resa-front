// src/contexts/UserContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { clientApiService } from '@/lib/client-api-service'

type User = {
  name: string
  email: string
  avatar: string
}

type UserContextType = {
  user: User | null
  loading: boolean
  logout: () => void
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Liste des routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = ['/login', '/register', '/forgot-password']

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  const fetchUser = async () => {
    // Ne pas essayer de récupérer l'utilisateur sur les routes publiques
    if (publicRoutes.includes(pathname)) {
      setLoading(false)
      return
    }

    try {
      const userData = await clientApiService.getCurrentUser()
      setUser({
        name: userData.name || userData.email,
        email: userData.email,
        avatar: userData.avatar || '/avatars/default-avatar.png',
      })
    } catch (error) {
      console.error('Failed to fetch user:', error)
      // Ne pas rediriger automatiquement, laisser le middleware gérer
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Supprimer le token
    document.cookie =
      'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    setUser(null)
    window.location.href = '/login' // Utiliser window.location pour forcer un rechargement
  }

  useEffect(() => {
    fetchUser()
  }, [pathname]) // Rafraîchir l'utilisateur quand la route change

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
