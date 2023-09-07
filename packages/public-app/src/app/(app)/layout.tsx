import '../globals.css'
import { Kanit } from 'next/font/google'
import type { ReactNode } from 'react'
import { RootClientLayout } from './layoutClient'

const kanit = Kanit({ weight: '300', preload: false })

export const metadata = {
  title: 'Panfactum',
  description: 'Software monetization platform'
}

export default function RootLayout (
  { children } : {children: ReactNode}
) {
  return (
    <html lang="en">
      <body className={`${kanit.className}`}>
        <RootClientLayout>
          {children}
        </RootClientLayout>
      </body>
    </html>
  )
}
