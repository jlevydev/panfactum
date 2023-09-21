import Fastify from 'fastify'
import cors from '@fastify/cors'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyCookieOptions } from '@fastify/cookie'
import { registerExitHandlers } from './exit'
import { COOKIE_SIGNING_SECRET, ENV, PUBLIC_URL } from './environment'
import { UserRoutes } from './routes/user'
import { HealthRoutes } from './routes/health'
import { AuthRoutes } from './routes/auth'
import { DevRoutes } from './routes/dev'
import { AdminRoutes } from './routes/admin'
import { errorHandler } from './handlers/error'
import { AUTH_COOKIE_NAME, authCookieRequestHook } from './routes/auth/authCookie'

// eslint-disable-next-line
// @ts-ignore
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string
    loginSessionId?: string,
    masqueradingUserId?: string | null
  }
}

export function launchServer () {
  const server = Fastify().withTypeProvider<TypeBoxTypeProvider>()

  /********************************************************************
   * Error Handlers
   *******************************************************************/
  server.setErrorHandler(errorHandler)

  /********************************************************************
   * Exit Handlers
   *******************************************************************/
  registerExitHandlers({ server })

  /********************************************************************
   * Setup CORS
   *******************************************************************/
  void server.register(cors, {})

  /********************************************************************
   * Swagger Configuration
   *******************************************************************/
  if (ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    void server.register(require('@fastify/swagger'), {
      openapi: {
        info: {
          title: 'Panfactum API',
          description: 'The primary API server powering Panfactum',
          version: '1.0.0'
        },
        servers: [{
          url: PUBLIC_URL
        }],
        components: {
          securitySchemes: {
            cookie: {
              type: 'apiKey',
              name: AUTH_COOKIE_NAME,
              in: 'cookie'
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
        deepLinking: true,
        showExtensions: true,
        showCommonExtensions: true,
        displayRequestDuration: true,
        tryItOutEnabled: true,
        onComplete: function () {
          console.log('hey')
        }
      },
      staticCSP: true,
      transformSpecificationClone: true
    })
  }

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
  server.decorateRequest('userId', '')
  server.decorateRequest('loginSessionId', '')
  server.decorateRequest('masqueradingUserId', '')
  server.addHook('onRequest', authCookieRequestHook)

  /********************************************************************
   * Route Bindings
   *******************************************************************/
  const prefix = '/v1'
  void server.register(HealthRoutes, { prefix })
  void server.register(UserRoutes, { prefix })
  void server.register(AuthRoutes, { prefix })
  void server.register(AdminRoutes, { prefix })

  if (ENV === 'development') {
    void server.register(DevRoutes, { prefix })
  }

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
}
