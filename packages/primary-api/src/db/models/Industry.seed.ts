import { faker } from '@faker-js/faker'
import type { Kysely } from 'kysely'
import type { Database } from './Database'
import type { IndustryTable } from './Industry'

export function createRandomIndustry (): IndustryTable {
  const name = faker.commerce.productName()
  return {
    id: faker.datatype.uuid(),
    slug: name.toLowerCase().substring(0, 15),
    name
  }
}

export async function seedIndustryTable (db: Kysely<Database>, count = 25) {
  faker.seed(123)
  const industries = [...Array(count).keys()].map(() => createRandomIndustry())
  await db.insertInto('industry')
    .values(industries)
    .execute()
  return industries
}

export async function truncateIndustryTable (db: Kysely<Database>) {
  await db.deleteFrom('industry')
    .execute()
}
