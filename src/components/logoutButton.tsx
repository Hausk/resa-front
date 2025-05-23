'use client'

import { Button } from './ui/button'
import { logoutUser } from '@/lib/auth'

export default function LogoutButton() {
  return <Button onClick={logoutUser}>Logout</Button>
}
