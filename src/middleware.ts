import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Appliquer sur toutes les routes ou les routes protégées
export const config = {
  matcher: ['/dashboard/:path*', '/bookings/:path*'],
}
