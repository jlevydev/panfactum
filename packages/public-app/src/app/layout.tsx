import './globals.css'
import type { ReactNode } from 'react'

import { kanit } from './font'

export const metadata = {
  title: 'Panfactum',
  description: 'Software monetization platform'
}

export default function RootLayout (
  { children } : {children: ReactNode}
) {
  return (
    <html lang="en">
      <body
        id="root"
        className={`${kanit.className}`}
      >
        {children}
      </body>
    </html>
  )
}
