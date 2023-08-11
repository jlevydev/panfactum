import { faker } from '@faker-js/faker'
import type { Kysely } from 'kysely'
import type { Database } from './Database'
import type { ReachSnapshotTable } from './ReachSnapshot'
import type { OrganizationTable } from './Organization'

export function createRandomReachSnapshot (organization: OrganizationTable): ReachSnapshotTable {
  return {
    id: faker.datatype.uuid(),
    organization_id: organization.id,
    collected_at: faker.date.between('2020-01-01T00:00:00.000Z', '2023-01-01T00:00:00.000Z'),
    instagram_followers: faker.datatype.boolean() ? null : faker.datatype.number({ min: 10000, max: 10000000 }),
    tiktok_followers: faker.datatype.boolean() ? null : faker.datatype.number({ min: 10000, max: 10000000 }),
    youtube_subscribers: faker.datatype.boolean() ? null : faker.datatype.number({ min: 10000, max: 10000000 })
  }
}

export async function seedReachSnapshotTable (db: Kysely<Database>, organizations: OrganizationTable[]) {
  faker.seed(123)

  // Ensures that each org has 1-5 snapshots
  const snapshots = organizations.map(org => [...Array(faker.datatype.number({ min: 1, max: 5 })).keys()]
    .map(() => createRandomReachSnapshot(org))).flat(1)

  await db.insertInto('reach_snapshot')
    .values(snapshots)
    .execute()
  return snapshots
}

export async function truncateReachSnapshotTable (db: Kysely<Database>) {
  await db.deleteFrom('reach_snapshot')
    .execute()
}
