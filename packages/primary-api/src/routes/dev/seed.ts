import type { FastifyPluginAsync } from 'fastify'
import { Static, Type } from '@sinclair/typebox'
import { getDB } from '../../db/db'
import { sql } from 'kysely'
import { faker } from '@faker-js/faker'
import { seedUserTable, truncateUserTable } from '../../db/models/User.seed'
import { seedUserLoginSessionTable, truncateLoginSessionTable } from '../../db/models/UserLoginSession.seed'
import {
  seedOrganizationTable,
  seedOrganizationTableUnitary,
  truncateOrganizationTable
} from '../../db/models/Organization.seed'
import {
  seedUserOrganizationTable,
  seedUserOrganizationTableUnitary,
  truncateUserOrganizationTable
} from '../../db/models/UserOrganization.seed'
import { seedPackageTable, truncatePackageTable } from '../../db/models/Package.seed'
import { seedPackageVersionTable, truncatePackageVersionTable } from '../../db/models/PackageVersion.seed'
import { seedPackageDownloadTable, truncatePackageDownloadTable } from '../../db/models/PackageDownload.seed'
import type { FastifySchemaWithSwagger } from '../constants'
import { seedOrganizationRoleTable, truncateOrganizationRoleTable } from '../../db/models/OrganizationRole.seed'
import {
  seedOrganizationRolePermissionTable,
  truncateOrganizationRolePermissionTable
} from '../../db/models/OrganizationRolePermission.seed'

/**********************************************************************
 * Typings
 **********************************************************************/

const SeedBody = Type.Object({
  iterations: Type.Optional(Type.Integer({
    minimum: 1,
    maximum: 25,
    default: 5,
    description: 'The number of iterations of the database seeding loop to execute'
  })),
  orgsPerIteration: Type.Optional(Type.Integer({
    minimum: 1,
    maximum: 10,
    default: 5,
    description: 'The number of organizations to create on each iteration'
  })),
  maxUsersPerOrg: Type.Optional(Type.Integer({
    minimum: 2,
    maximum: 100,
    default: 25,
    description: 'The maximum number of users to assign to any organization'
  })),
  maxRolesPerOrg: Type.Optional(Type.Integer({
    minimum: 1,
    maximum: 10,
    default: 5,
    description: 'The maximum number of custom roles to add to any organization'
  })),
  maxPackagesPerOrg: Type.Optional(Type.Integer({
    minimum: 1,
    maximum: 20,
    default: 5,
    description: 'The maximum number of packages in any organization'
  })),
  maxVersionsPerPackage: Type.Optional(Type.Integer({
    minimum: 5,
    maximum: 100,
    default: 20,
    description: 'The maximum number of versions for any package'
  })),
  maxDownloadsPerPackageVersion: Type.Optional(Type.Integer({
    minimum: 100,
    maximum: 10000000,
    default: 10000,
    description: 'The maximum number of downloads any package version can have'
  }))
})
type SeedBodyType = Static<typeof SeedBody>

/**********************************************************************
 * Route Logic
 **********************************************************************/

interface IPopulateDataConfig {
  iterations: number;
  orgsPerIteration: number;
  maxUsersPerOrg: number;
  maxRolesPerOrg: number;
  maxPackagesPerOrg: number;
  maxVersionsPerPackage: number;
  maxDownloadsPerPackageVersion: number;
}

async function populateData (config :IPopulateDataConfig): Promise<void> {
  const {
    iterations,
    orgsPerIteration,
    maxUsersPerOrg,
    maxRolesPerOrg,
    maxPackagesPerOrg,
    maxVersionsPerPackage,
    maxDownloadsPerPackageVersion
  } = config

  // execute the data population
  faker.seed(123)
  console.log('Seeding user table...')
  const users = await seedUserTable(5000)
  console.log('Done!')

  console.log('Seeding unitary orgs...')
  const unitaryOrgs = await seedOrganizationTableUnitary(users)
  await seedUserOrganizationTableUnitary(users, unitaryOrgs)
  console.log('Done!')

  for (let i = 0; i < iterations; i++) {
    console.log(`Beginning iteration ${i + 1}...`)

    console.log('Seeding org table...')
    const organizations = await seedOrganizationTable(orgsPerIteration)
    console.log('Done!')

    console.log('Seeding org role table...')
    const roles = await seedOrganizationRoleTable(organizations, maxRolesPerOrg)
    console.log('Done!')

    console.log('Seeding org role permission table...')
    await seedOrganizationRolePermissionTable(roles)
    console.log('Done!')

    console.log('Assigning users to orgs...')
    const userOrgs = await seedUserOrganizationTable(users, organizations, roles, maxUsersPerOrg)
    console.log('Done!')

    console.log('Creating packages...')
    const packages = await seedPackageTable(organizations, maxPackagesPerOrg)
    console.log('Done!')

    console.log('Creating package versions...')
    const packageVersions = await seedPackageVersionTable(packages, userOrgs, maxVersionsPerPackage)
    console.log('Done!')

    console.log('Seeding package download records...')
    await seedPackageDownloadTable(packageVersions, users, maxDownloadsPerPackageVersion)
    console.log('Done!')

    console.log(`Finished iteration ${i + 1}!`)
  }

  console.log('Seeding user login session table...')
  await seedUserLoginSessionTable(users, 500000)
  console.log('Done!')
}

async function truncateData (): Promise<void> {
  await truncatePackageDownloadTable()
  await truncatePackageVersionTable()
  await truncatePackageTable()
  await truncateUserOrganizationTable()
  await truncateOrganizationRolePermissionTable()
  await truncateOrganizationRoleTable()
  await truncateOrganizationTable()
  await truncateLoginSessionTable()
  await truncateUserTable()
}

// For canceling in-flight seeds
let previousSeedAbortController: null | AbortController = null
class AbortError extends Error {
  constructor () {
    super('')
  }
}

// For delaying server shutdown until seeding is complete
export let activeSeedingPromise: null | Promise<void> = null

export const SeedRoute:FastifyPluginAsync = async (fastify) => {
  void fastify.post<{Body: Required<SeedBodyType>}, undefined, FastifySchemaWithSwagger>(
    '/seed',
    {
      schema: {
        description: 'Loads the database with fake test data',
        body: SeedBody,
        response: {
          200: {
            description: 'Database seeding was started',
            type: 'null'
          }
        }
      }
    },
    async (req) => {
      // Cancel the previous data seed call so we don't have two running concurrently;
      // NOTE: This ONLY works if all data seed calls go to the same api server instance
      // which really only applies in local development
      if (previousSeedAbortController !== null) {
        previousSeedAbortController.abort()
      }
      const newAbortController = new AbortController()
      previousSeedAbortController = newAbortController

      // We don't await this promise as we want it to run in the background
      // and not block the request since it is likely to take a few minutes
      activeSeedingPromise = (() => {
        return new Promise<void>((resolve, reject) => {
          // allows us to cancel the data population
          newAbortController.signal.addEventListener('abort', () => {
            console.log('Data seeding aborted!')
            reject(new AbortError())
          })
          console.log('Beginning to truncate data')
          void truncateData()
            .then(() => {
              console.log('Truncated data')
              console.log('Beginning DB VACUUM FULL')
              return getDB().then(db => sql`VACUUM FULL`.execute(db))
            }).then(() => {
              console.log('DB vacuumed')
              console.log('Beginning DB REINDEX')
              return getDB().then(db => sql`REINDEX SCHEMA public`.execute(db))
            }).then(() => {
              console.log('Reindexing complete')
              console.log('Beginning DB ANALYZE')
              return getDB().then(db => sql`ANALYZE`.execute(db))
            })
            .then(() => {
              console.log('DB reanalyzed')
              console.log('Beginning DB seeding')
              return populateData(req.body)
            })
            .then(() => {
              console.log('Finished DB seeding')
              resolve()
            })
        })
      })()
        .catch((err) => {
          if (!(err instanceof AbortError)) {
            console.error(err)
          }
        })
        .then(() => { activeSeedingPromise = null })
    }
  )
}
