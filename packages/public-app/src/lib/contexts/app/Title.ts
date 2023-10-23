import { createContext } from 'react'

export interface ITitle {
  header: string;
  id?: string
}
export const TitleContext = createContext<{
  title?: ITitle;
  setTitle:(title?: ITitle) => void
    }>({
      setTitle: () => {}
    })
