import { faker } from '@faker-js/faker'
import type { Kysely } from 'kysely'
import type { Database } from './Database'
import type { DeliverableTable } from './Deliverable'

export function createRandomDeliverable (): DeliverableTable {
  return {
    id: faker.datatype.uuid(),
    platform: faker.helpers.arrayElement(['youtube', 'tiktok', 'instagram']),
    content_type: faker.helpers.arrayElement(['post', 'video', 'story']),
    user_posted: faker.datatype.boolean(),
    boosted: faker.datatype.boolean(),
    count: faker.datatype.number({ min: 1, max: 10 })
  }
}

export async function seedDeliverableTable (db: Kysely<Database>, count = 1000) {
  faker.seed(123)
  const deliverables = [...Array(count).keys()].map(() => createRandomDeliverable())
  await db.insertInto('deliverable')
    .values(deliverables)
    .execute()
  return deliverables
}

export async function truncateDeliverableTable (db: Kysely<Database>) {
  await db.deleteFrom('deliverable')
    .execute()
}
