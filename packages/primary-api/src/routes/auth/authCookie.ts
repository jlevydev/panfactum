import type { FastifyReply, FastifyRequest } from 'fastify'
import { getDB } from '../../db/db'

export const AUTH_COOKIE_NAME = 'panforiAuth'
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 4 // a login session lasts for 4 hours if no further requests are made

export interface IAuthCookieInfo {
  loginSessionId: string;
  userId: string;
  masqueradingUserId: string | null;
}

// Set the authentication cookie on a fastify reply
export function setAuthCookie (reply: FastifyReply, info: IAuthCookieInfo) {
  void reply.setCookie(
    AUTH_COOKIE_NAME,
    JSON.stringify(info),
    {
      path: '/',
      signed: true,
      secure: true,
      maxAge: AUTH_COOKIE_MAX_AGE,
      // httpOnly: true,
      sameSite: 'strict'
    }
  )
}

// Clear the authentication cookie on a fastify reply
export function clearAuthCookie (reply: FastifyReply) {
  void reply.clearCookie(AUTH_COOKIE_NAME)
}

// Used on incoming requests to:
// 1. Guard against invalid cookies
// 2. Parse the cookie info an make it available inside route handlers
export async function authCookieRequestHook (req: FastifyRequest, reply: FastifyReply) {
  const rawCookie = req.cookies[AUTH_COOKIE_NAME]

  // If the cookie isn't present on the request,
  // nothing needed to be done
  if (typeof rawCookie !== 'string') {
    return
  }

  // All of our cookies are signed. To separate the value from the signature
  // we have to run this function.
  const { value, valid } = req.unsignCookie(rawCookie)

  if (!valid) {
    // If the cookie's signature was invalid, then we should just immediately
    // return a 403, and we should clear the cookie
    reply.statusCode = 403
    void reply.clearCookie(AUTH_COOKIE_NAME)
    void reply.send()
  } else if (value) {
    try {
      const { userId, loginSessionId, masqueradingUserId } = JSON.parse(value) as { userId: string, loginSessionId: string, masqueradingUserId: string | null }
      req.userId = userId
      req.loginSessionId = loginSessionId
      req.masqueradingUserId = masqueradingUserId

      void (await getDB())
        .updateTable('userLoginSession')
        .set({
          lastApiCallAt: new Date()
        })
        .where('id', '=', loginSessionId)
        .execute()
    } catch (e) {
      // If we aren't able to parse the cookie, then this should be treated
      // as a 400 (malformed request) and we should clear the cookie
      reply.statusCode = 400
      void reply.clearCookie(AUTH_COOKIE_NAME)
      void reply.send()
    }
  }
}
