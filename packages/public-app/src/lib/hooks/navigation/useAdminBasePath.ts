import { useResolvedPath } from 'react-router-dom'

export function useAdminBasePath () {
  const currentPath = useResolvedPath('').pathname
  return `/${currentPath.split('/').slice(1, 3).join('/')}`
}
