import { API_URL } from '../../constants'

/**********************************************
 * Standard API Errors
 * ********************************************/
type ErrorArray = Array<{
  type: string,
  message: string
  resourceId?: string
}>
export class APIServerError extends Error {
  errors: ErrorArray
  status: number
  constructor (status: number, errors: ErrorArray) {
    super()
    this.errors = errors
    this.status = status
  }
}

/**********************************************
 * Standard API Response Handler
 * ********************************************/

async function handleResponse<ReturnType = undefined> (res: Response):Promise<ReturnType> {
  if (res.ok) {
    if (res.headers.get('content-length') !== '0') {
      return await res.json() as Promise<ReturnType>
    } else {
      return undefined as ReturnType
    }
  } else {
    const errors = (await res.json()) as {errors: ErrorArray} | undefined
    throw new APIServerError(res.status, errors?.errors || [{
      type: 'Unknown', message: 'Unknown error occurred when trying to submit API request.'
    }])
  }
}

/**********************************************
 * Standard methods for fetching, posting, and deleting
 * ********************************************/

export async function apiFetch<ReturnType> (path:string, options: RequestInit = {}):Promise<ReturnType> {
  let retryCount = 0
  const retryMax = 3
  const _fetch = () => fetch(`${API_URL}${path}`, options).then(handleResponse<ReturnType>)
  while (retryCount < retryMax) {
    try {
      return await _fetch()
    } catch (e) {
      if (e instanceof TypeError) {
        console.error('apiFetch: failed due to network error... retrying')
        retryCount++
      } else {
        throw e
      }
    }
  }
  return _fetch()
}

export function apiPost<ReturnType, BodyType = object | Array<object>> (path:string, body?: BodyType, options: RequestInit = {}):Promise<ReturnType> {
  return fetch(`${API_URL}${path}`, {
    method: 'POST',
    ...(body === undefined
      ? {}
      : {
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }),
    ...options
  }).then(handleResponse<ReturnType>)
}

export function apiPut<ReturnType, BodyType = object | Array<object>> (path:string, body?: BodyType, options: RequestInit = {}):Promise<ReturnType> {
  return fetch(`${API_URL}${path}`, {
    method: 'PUT',
    ...(body === undefined
      ? {}
      : {
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }),
    ...options
  }).then(handleResponse<ReturnType>)
}

export function apiDelete<ReturnType> (path:string, options: RequestInit = {}): Promise<ReturnType> {
  return fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    ...options
  }).then(handleResponse<ReturnType>)
}
