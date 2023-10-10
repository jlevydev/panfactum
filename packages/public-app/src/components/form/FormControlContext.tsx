import { createContext } from 'react'
import type { Control } from 'react-hook-form'

export const FormControlContext = createContext<Control | null>(null)
