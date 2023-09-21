import { faker } from '@faker-js/faker'
import type { PackageTable } from './Package'
import type { PackageVersionTable } from './PackageVersion'
import type { UserOrganizationTable } from './UserOrganization'
import { getDB } from '../db'

export function createRandomPackageVersion (pkg: PackageTable, userId: string, versionCache: Set<string>): PackageVersionTable {
  const createdAt = faker.date.soon({ days: 1000, refDate: pkg.createdAt })
  let versionTag: string | null = null
  while (!versionTag) {
    const possibleVersionTag = faker.system.semver()
    if (!versionCache.has(possibleVersionTag)) {
      versionTag = possibleVersionTag
    }
  }
  return {
    packageId: pkg.id,
    versionTag,
    sizeBytes: faker.number.int({ min: Math.pow(10, 6), max: Math.pow(10, 12) }),
    createdAt,
    createdBy: userId,
    archivedAt: faker.datatype.boolean(0.9) ? null : faker.date.soon({ days: 100, refDate: createdAt })
  }
}

export async function seedPackageVersionTable (
  packages: PackageTable[],
  userOrgs: UserOrganizationTable[],
  maxPerPackage = 10
) {
  const activeUsers = userOrgs.filter(user => user.active)
  const versions = packages.map(pkg => {
    const orgId = pkg.organizationId
    const orgUsers = activeUsers.filter(user => user.organizationId === orgId)
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
