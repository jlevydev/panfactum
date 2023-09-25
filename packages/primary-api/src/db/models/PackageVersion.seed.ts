import { faker } from '@faker-js/faker'
import type { PackageVersionTable } from './PackageVersion'
import { getDB } from '../db'
import type { Selectable } from 'kysely'
import type { PackageTableSeed } from './Package.seed'
import type { UserOrganizationTableSeed } from './UserOrganization.seed'

export type PackageVersionTableSeed = Selectable<PackageVersionTable>

export function createRandomPackageVersion (pkg: PackageTableSeed, userId: string, versionCache: Set<string>): PackageVersionTableSeed {
  const createdAt = pkg.archivedAt === null
    ? faker.date.soon({ days: 1000, refDate: pkg.createdAt })
    : faker.date.between({ from: pkg.createdAt, to: pkg.archivedAt })
  const archivedAt = faker.datatype.boolean(0.9) ? null : faker.date.soon({ days: 100, refDate: createdAt })
  const deletedAt = archivedAt === null ? null : faker.datatype.boolean(0.5) ? null : faker.date.soon({ days: 100, refDate: archivedAt })
  let versionTag: string | null = null
  while (!versionTag) {
    const possibleVersionTag = faker.system.semver()
    if (!versionCache.has(possibleVersionTag)) {
      versionTag = possibleVersionTag
    }
  }
  return {
    id: faker.string.uuid(),
    packageId: pkg.id,
    versionTag,
    sizeBytes: faker.number.int({ min: Math.pow(10, 6), max: Math.pow(10, 12) }),
    createdAt,
    createdBy: userId,
    archivedAt,
    deletedAt
  }
}

export async function seedPackageVersionTable (
  packages: PackageTableSeed[],
  userOrgs: UserOrganizationTableSeed[],
  maxPerPackage = 10
) {
  const versions = packages.map(pkg => {
    const orgId = pkg.organizationId
    const orgUsers = userOrgs.filter(user => (
      user.organizationId === orgId && user.createdAt <= pkg.createdAt && (user.deletedAt === null || user.deletedAt >= pkg.createdAt)
    ))

    // If there are no viable users in this org who could have created the package version,
    // then this package gets no versions
    if (orgUsers.length === 0) {
      return []
    }
    const cache: Set<string> = new Set()
    return [...Array(faker.number.int({ max: maxPerPackage, min: 0 })).keys()].map(() => {
      const user = faker.helpers.arrayElement(orgUsers)
      const version = createRandomPackageVersion(pkg, user.userId, cache)
      cache.add(version.versionTag)
      return version
    })
  })
  for (const versionList of versions) {
    if (versionList.length > 0) {
      await (await getDB()).insertInto('packageVersion')
        .values(versionList)
        .execute()
    }
  }
  return versions.flat()
}

export async function truncatePackageVersionTable () {
  await (await getDB()).deleteFrom('packageVersion')
    .execute()
}
