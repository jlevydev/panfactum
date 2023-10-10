import type { FastifyCookieOptions } from '@fastify/cookie'
import cors from '@fastify/cors'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import FastURI from 'fast-uri'
import Fastify from 'fastify'

import { COOKIE_SIGNING_SECRET, ENV, PUBLIC_URL } from './environment'
import { registerExitHandlers } from './exit'
import { errorHandler } from './handlers/error'
import { AuthRoutes } from './routes/auth'
import { AUTH_COOKIE_NAME, authCookieRequestHook } from './routes/auth/authCookie'
import { DevRoutes } from './routes/dev'
import { HealthRoutes } from './routes/health'
import { LoginSessionsRoutes } from './routes/loginSessions'
import { OrganizationMembershipsRoutes } from './routes/organizationMemberships'
import { OrganizationRolesRoutes } from './routes/organizationRoles'
import { OrganizationsRoutes } from './routes/organizations'
import { PackageDownloadsRoutes } from './routes/packageDownloads'
import { PackageVersionsRoutes } from './routes/packageVersions'
import { PackagesRoutes } from './routes/packages'
import { UsersRoutes } from './routes/users'

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
   * Setup Validators
   *******************************************************************/
  const ajv = new Ajv({
    coerceTypes: 'array', // change data type of data to match type keyword
    useDefaults: true, // replace missing properties and items with the values from corresponding default keyword
    removeAdditional: false,
    uriResolver: FastURI,
    addUsedSchema: false,
    // Explicitly set allErrors to `false`.
    // When set to `true`, a DoS attack is possible.
    allErrors: false
  })
  addFormats(ajv)
  server.setValidatorCompiler(({ schema }) => {
    return ajv.compile(schema)
  })

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
  void server.register(AuthRoutes, { prefix })
  void server.register(UsersRoutes, { prefix })
  void server.register(PackageVersionsRoutes, { prefix })
  void server.register(PackagesRoutes, { prefix })
  void server.register(PackageDownloadsRoutes, { prefix })
  void server.register(OrganizationsRoutes, { prefix })
  void server.register(OrganizationRolesRoutes, { prefix })
  void server.register(OrganizationMembershipsRoutes, { prefix })
  void server.register(LoginSessionsRoutes, { prefix })
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
