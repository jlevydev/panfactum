import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // by default, query data will be cached locally for 1 minute
      staleTime: 60 * 1000
    }
  }
})
