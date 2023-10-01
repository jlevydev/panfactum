import type { RaRecord } from 'react-admin'

import { apiPost } from '@/lib/clients/api/apiFetch'

/**********************************************
 * Data Provider Specific API Clients
 *
 * These take the standard API client and enhance them
 * with data provider-specific logic
 * ********************************************/

export async function apiCreate (path: string, records: Array<object>): Promise<RaRecord[]> {
  return apiPost(path, records)
}
