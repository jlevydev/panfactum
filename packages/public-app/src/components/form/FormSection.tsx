import type { ReactNode } from 'react'
import React from 'react'

interface IFormSectionProps {
  title?: string
  children: ReactNode
}
export default function FormSection ({ title, children }: IFormSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      {title && (
        <h2 className="text-lg lg:text-2xl">
          {title}
        </h2>
      )}
      <div className="flex flex-col gap-6">
        {children}
      </div>
      <hr/>
    </div>
  )
}
