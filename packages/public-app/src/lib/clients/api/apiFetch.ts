import { API_URL } from '../../constants'

/**********************************************
 * Standard API Errors
 * ********************************************/
export class APIUnauthenticatedError extends Error {
  constructor () {
    super('User is not authenticated')
  }
}

export class APIUnauthorizedError extends Error {
  constructor () {
    super('User is not authorized')
  }
}

export class APIServerError extends Error {
  constructor () {
    super('API server unavailable')
  }
}

/**********************************************
 * Standard API Response Handler
 * ********************************************/

function handleResponse<ReturnType = undefined> (res: Response):Promise<ReturnType> {
  if (res.ok) {
    if (res.headers.get('content-length') !== '0') {
      return res.json() as Promise<ReturnType>
    } else {
      return Promise.resolve(undefined) as Promise<ReturnType>
    }
  } else if (res.status === 401) {
    throw new APIUnauthenticatedError()
  } else if (res.status === 403) {
    throw new APIUnauthorizedError()
  } else if (res.status >= 500) {
    throw new APIServerError()
  } else {
    throw new Error(res.statusText)
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

export function apiDelete<ReturnType> (path:string, options: RequestInit = {}):Promise<ReturnType> {
  return fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    ...options
  }).then(handleResponse<ReturnType>)
}
