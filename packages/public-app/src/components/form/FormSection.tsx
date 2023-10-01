import type { ReactElement } from 'react'
import React from 'react'

interface IFormSectionProps {
  title: string
  children: ReactElement
}
export default function FormSection ({ title, children }: IFormSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg">
        {title}
      </h2>
      {children}
      <hr/>
    </div>
  )
}
