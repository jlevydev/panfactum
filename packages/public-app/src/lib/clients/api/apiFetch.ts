import { API_URL } from '../../constants'

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

function handleResponse<ReturnType> (res: Response):Promise<ReturnType> {
  if (res.ok) {
    return res.json() as Promise<ReturnType>
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

export function apiFetch<ReturnType> (path:string, options: RequestInit = {}):Promise<ReturnType> {
  return fetch(`${API_URL}${path}`, options).then(handleResponse<ReturnType>)
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
