import { Outfit } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { UserProvider } from '@/contexts/UserContext'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <title>FlexOffice</title>
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <UserProvider>
          {children}
          <Toaster richColors />
        </UserProvider>
      </body>
    </html>
  )
}
