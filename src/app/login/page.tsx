'use client'

import { Button } from '@/components/ui/button'
import { useUser } from '@/contexts/UserContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('from') || '/dashboard'
  const error = searchParams.get('error')

  useEffect(() => {
    if (user && !loading) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  const handleGoogleLogin = () => {
    window.location.href = `http://localhost:3333/auth/google/redirect`
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Erreur lors de la connexion. Veuillez réessayer.
          </div>
        )}
        <Button onClick={handleGoogleLogin}>Se connecter avec Google</Button>
      </div>
    </div>
  )
}
