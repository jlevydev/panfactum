// All environment variables used in the app should be read in
// via this file

const undefinedMarker = 'not-defined'

// We disable eslint here as it wants to transform the process.env['X'] into process.env.X which breaks
// the typescript compiler
/* eslint-disable */
export const PG_CREDS_PATH = process.env['PG_CREDS_PATH'] ?? undefinedMarker
export const PG_HOSTNAME = process.env['PG_HOSTNAME'] ?? undefinedMarker
export const PG_PORT = parseInt(process.env['PG_PORT'] ?? '5432')
export const PG_DATABASE = process.env['PG_DATABASE'] ?? 'app'
export const COOKIE_SIGNING_SECRET = process.env['COOKIE_SIGNING_SECRET'] ?? undefinedMarker
export const NODE_ENV = process.env['NODE_ENV'] ?? undefinedMarker
export const ENV = process.env['ENV'] ?? undefinedMarker
/* eslint-enable */

// Checks to ensure that environment variables were properly set
const MUST_BE_DEFINED: {[name: string]: string} = {
  PG_CREDS_PATH,
  PG_HOSTNAME,
  COOKIE_SIGNING_SECRET
}
for (const envVar in MUST_BE_DEFINED) {
  if (MUST_BE_DEFINED[envVar] === undefinedMarker) {
    throw new Error(`Environment variable ${envVar} was not set!`)
  }
}
