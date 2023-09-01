import Fastify from 'fastify'
import cors from '@fastify/cors'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { Static } from '@sinclair/typebox'

import type { FastifyCookieOptions } from '@fastify/cookie'
import { AuthLoginRoute, LoginReturnType } from './routes/auth/login'
import { AUTH_COOKIE_NAME } from './routes/auth/constants'
import { AuthInfoRoute } from './routes/auth/info'
import { AuthLogoutRoute } from './routes/auth/logout'
import { getDB } from './db/db'
import { HealthzRoute } from './routes/health/healthz'
import { COOKIE_SIGNING_SECRET } from './environment'

const server = Fastify().withTypeProvider<TypeBoxTypeProvider>()
void server.register(cors, {})

/********************************************************************
 * Swagger Configuration
 *******************************************************************/
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
void server.register(require('@fastify/swagger'), {
  openapi: {
    info: {
      title: 'Panfactum API',
      description: 'The primary API server powering Panfactum',
      version: '1.0.0'
    },
    servers: [{
      url: 'http://localhost/api'
    }],
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          name: 'apiKey',
          in: 'header'
        }
      }
    }
  },
  hideUntagged: false,
  exposeRoute: true
})

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
void server.register(require('@fastify/swagger-ui'), {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true
  },
  staticCSP: true,
  transformSpecificationClone: true
})

/********************************************************************
 * Cookie Handling
 *******************************************************************/
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
void server.register(require('@fastify/cookie'), {
  secret: COOKIE_SIGNING_SECRET, // for cookies signature
  hook: 'onRequest'
} as FastifyCookieOptions)

/********************************************************************
 * Login Session Handling
 *
 * A "login session" is a set of requests coming from a single
 * user & device.
 *
 * We group requests into a login session based on
 * the <AUTH_COOKIE_NAME> cookie that is set by the authentication
 * endpoints.
 *
 * The below hook decorates the fastify request object with
 * userId and loginSessionId parameters so that they can be used
 * for subsequent authz/n in the request handlers.
 *******************************************************************/
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string
    loginSessionId?: string
  }
}
server.decorateRequest('userId', '')
server.decorateRequest('loginSessionId', '')
server.addHook('onRequest', async (req, res) => {
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
    res.statusCode = 403
    void res.clearCookie(AUTH_COOKIE_NAME)
    void res.send()
  } else if (value) {
    try {
      const { userId, loginSessionId } = JSON.parse(value) as { userId: string, loginSessionId: string }
      req.userId = userId
      req.loginSessionId = loginSessionId

      void (await getDB())
        .updateTable('user_login_session')
        .set({
          last_api_call_at: new Date()
        })
        .where('id', '=', loginSessionId)
        .execute()
    } catch (e) {
      // If we aren't able to parse the cookie, then this should be treated
      // as a 400 (malformed request) and we should clear the cookie
      res.statusCode = 400
      void res.clearCookie(AUTH_COOKIE_NAME)
      void res.send()
    }
  }
})

/********************************************************************
 * Route Bindings
 *******************************************************************/
void server.register((app, _, done) => {
  app.route(AuthLoginRoute)
  app.route(AuthInfoRoute)
  app.route(AuthLogoutRoute)
  app.route(HealthzRoute)
  done()
}, { prefix: '/v1' })

/********************************************************************
 * Server Startup
 *******************************************************************/
server.listen({ host: '0.0.0.0', port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})

/********************************************************************
 * Test Exports
 *******************************************************************/

export type LoginReturnType = Static<typeof LoginReturnType>
