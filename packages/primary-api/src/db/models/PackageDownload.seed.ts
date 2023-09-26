import { faker } from '@faker-js/faker'
import type { PackageDownloadTable } from './PackageDownload'
import { getDB } from '../db'
import type { UserTableSeed } from './User.seed'
import type { PackageVersionTableSeed } from './PackageVersion.seed'
import type { Selectable } from 'kysely'

export type PackageDownloadTableSeed = Selectable<PackageDownloadTable>

export function createRandomPackageDownload (pkg: PackageVersionTableSeed, users: UserTableSeed[]): PackageDownloadTableSeed {
  const createdAt = pkg.deletedAt === null
    ? faker.date.soon({ days: 500, refDate: pkg.createdAt })
    : faker.date.between({ from: pkg.createdAt, to: pkg.deletedAt })
  return {
    id: faker.string.uuid(),
    versionId: pkg.id,
    userId: faker.helpers.arrayElement(users).id,
    createdAt,
    ip: faker.internet.ipv4()
  }
}

export async function seedPackageDownloadTable (
  packageVersions: PackageVersionTableSeed[],
  users: UserTableSeed[],
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
