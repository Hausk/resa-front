'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')

    if (token) {
      // Stocke le token dans un cookie pour 30 jours
      document.cookie = `auth_token=${token}; path=/; max-age=2592000; Secure; SameSite=Strict`

      // Redirection vers le panel
      router.replace('/panel')
    }
  }, [searchParams, router])

  return null // Aucun affichage
}
