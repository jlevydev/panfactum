import type { Identifier, RaRecord } from 'react-admin'

import { apiDelete as rawApiDelete } from '@/lib/clients/api/apiFetch'

/**********************************************
 * Data Provider Specific API Clients
 *
 * These take the standard API client and enhance them
 * with data provider-specific logic
 * ********************************************/

export async function apiDelete (path: string, ids: Identifier[]): Promise<RaRecord[]> {
  const queryString = `${ids.map(id => `ids=${encodeURIComponent(id)}`).join('&')}`
  return rawApiDelete(`${path}?${queryString}`)
}
