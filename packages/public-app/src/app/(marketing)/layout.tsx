import type { ReactNode } from 'react'

import Navbar from './navbar'

export default function RootLayout (
  { children } : {children: ReactNode}
) {
  return (
    <div className="max-w-7xl mx-auto bg-base-100">
      <Navbar/>
      {children}
      <footer className="border-t-4 border-t-base-300 text-right p-8">
        (c) Panfactum, Inc. 2023
      </footer>
    </div>
  )
}
