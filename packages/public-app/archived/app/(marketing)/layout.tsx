import '../globals.css'
import { Kanit } from 'next/font/google'
import type { ReactNode } from 'react'
import Navbar from './navbar'

const kanit = Kanit({ weight: '300', preload: false })

export const metadata = {
  title: 'Panfactum',
  description: 'Software monetization platform'
}

export default function RootLayout (
  { children } : {children: ReactNode}
) {
  return (
    <html
      lang="en"
      data-theme="business"
      className="h-screen"
    >
      <body className={`${kanit.className} bg-base-300 min-h-screen`}>
        <div className="max-w-7xl mx-auto bg-base-100">
          <Navbar/>
          {children}
          <footer className="border-t-4 border-t-base-300 text-right p-8">
            (c) Panfactum, Inc. 2023
          </footer>
        </div>
      </body>
    </html>
  )
}
