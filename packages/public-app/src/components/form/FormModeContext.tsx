import { createContext } from 'react'

export const FormModeContext = createContext<'edit' | 'show' | 'create'>('edit')
