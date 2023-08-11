import { faker } from '@faker-js/faker'
import type { Kysely } from 'kysely'
import type { Database } from './Database'
import type { BrandTable } from './Brand'

export function createRandomBrand (): BrandTable {
  const state = faker.address.state()
  return {
    id: faker.datatype.uuid(),
    name: faker.company.name(),
    address1: faker.address.streetAddress(),
    address2: faker.datatype.boolean() ? faker.address.secondaryAddress() : '',
    city: faker.address.cityName(),
    zip: faker.address.zipCodeByState(state),
    state,
    country: 'US',
    verified: faker.datatype.boolean()
  }
}

export async function seedBrandTable (db: Kysely<Database>, count = 25) {
  faker.seed(123)
  const brands = [...Array(count).keys()].map(() => createRandomBrand())
  await db.insertInto('brand')
    .values(brands)
    .execute()
  return brands
}

export async function truncateBrandTable (db: Kysely<Database>) {
  await db.deleteFrom('brand')
    .execute()
}
