import { faker } from '@faker-js/faker'
import type { PackageVersionTable } from './PackageVersion'
import type { UserTable } from './User'
import type { PackageDownloadTable } from './PackageDownload'
import { getDB } from '../db'

export function createRandomPackageDownload (pkg: PackageVersionTable, users: UserTable[]): PackageDownloadTable {
  return {
    packageId: pkg.packageId,
    versionTag: pkg.versionTag,
    userId: faker.helpers.arrayElement(users).id,
    createdAt: faker.date.soon({ days: 500, refDate: pkg.createdAt }),
    ip: faker.internet.ipv4()
  }
}

export async function seedPackageDownloadTable (
  packageVersions: PackageVersionTable[],
  users: UserTable[],
  maxPerPackageVersion = 10000
) {
  for (const pkg of packageVersions) {
    const isPopular = faker.datatype.boolean(0.01)
    const targetDownloadCount = faker.number.int({ max: isPopular ? maxPerPackageVersion : maxPerPackageVersion / 10, min: 0 })
    if (targetDownloadCount > 0) {
      let runningDownloadCount = 0
      while (runningDownloadCount < targetDownloadCount) {
        const nextBatchDownloads = Math.min(10000, targetDownloadCount - runningDownloadCount)
        const downloads = [...Array(nextBatchDownloads).keys()].map(() => {
          return createRandomPackageDownload(pkg, users)
        })
        await (await getDB()).insertInto('packageDownload')
          .values(downloads)
          .execute()
        runningDownloadCount += nextBatchDownloads
      }
    }
  }
}

export async function truncatePackageDownloadTable () {
  await (await getDB()).deleteFrom('packageDownload')
    .execute()
}
