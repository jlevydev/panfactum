import { faker } from '@faker-js/faker'
import type { Kysely } from 'kysely'
import type { Database } from './Database'
import type { DealTable } from './Deal'
import type { OrganizationTable } from './Organization'
import type { BrandTable } from './Brand'
import type { ReachSnapshotTable } from './ReachSnapshot'
import type { IndustryTable } from './Industry'

export function createRandomDeal (
  organizations: OrganizationTable[],
  brands: BrandTable[],
  snapshots: ReachSnapshotTable[],
  industries: IndustryTable[]
): DealTable {
  const organization = faker.helpers.arrayElement(organizations)
  return {
    id: faker.datatype.uuid(),
    organization_id: organization.id,
    dollar_amount: faker.datatype.float({ min: 100, max: 100000, precision: 2 }),
    status: faker.helpers.arrayElement(['draft', 'reviewing', 'verified']),
    reach_snapshot_id: faker.helpers.arrayElement(snapshots.filter(snapshot => snapshot.organization_id === organization.id)).id,
    executed_at: faker.date.between('2020-01-01T00:00:00.000Z', '2023-01-01T00:00:00.000Z'),
    brand_id: faker.helpers.arrayElement(brands).id,
    industry_id: faker.helpers.arrayElement(industries).id,
    deadline_days_from_execution: faker.datatype.number({ min: 10, max: 180 }),
    effort_score: (faker.datatype.boolean() ? null : (faker.datatype.number({ min: 1, max: 5 }))) as 1 | 2 | 3 | 4 | 5 | null,
    sellout_score: (faker.datatype.boolean() ? null : (faker.datatype.number({ min: 1, max: 5 }))) as 1 | 2 | 3 | 4 | 5 | null,
    brand_score: (faker.datatype.boolean() ? null : (faker.datatype.number({ min: 1, max: 5 }))) as 1 | 2 | 3 | 4 | 5 | null
  }
}

export async function seedDealTable (
  db: Kysely<Database>,
  organizations: OrganizationTable[],
  brands: BrandTable[],
  snapshots: ReachSnapshotTable[],
  industries: IndustryTable[],
  count = 500
) {
  faker.seed(123)
  const deals = [...Array(count).keys()].map(() => createRandomDeal(organizations, brands, snapshots, industries))
  await db.insertInto('deal')
    .values(deals)
    .execute()
  return deals
}

export async function truncateDealTable (db: Kysely<Database>) {
  await db.deleteFrom('deal')
    .execute()
}
