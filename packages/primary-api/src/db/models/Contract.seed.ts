import { faker } from '@faker-js/faker'
import type { Kysely } from 'kysely'
import type { Database } from './Database'
import type { ContractTable } from './Contract'

export function createRandomContract (): ContractTable {
  return {
    id: faker.datatype.uuid(),
    link: faker.internet.url(),
    uploaded_at: faker.date.between('2020-01-01T00:00:00.000Z', '2023-01-01T00:00:00.000Z')
  }
}

export async function seedContractTable (db: Kysely<Database>, count = 1000) {
  faker.seed(123)
  const contracts = [...Array(count).keys()].map(() => createRandomContract())
  await db.insertInto('contract')
    .values(contracts)
    .execute()
  return contracts
}

export async function truncateContractTable (db: Kysely<Database>) {
  await db.deleteFrom('contract')
    .execute()
}
