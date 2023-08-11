import { faker } from '@faker-js/faker'
import type { Kysely } from 'kysely'
import type { Database } from './Database'
import type { DealDeliverableTable } from './DealDeliverable'
import type { DealTable } from './Deal'
import type { DeliverableTable } from './Deliverable'

export function createRandomDealDeliverable (deal: DealTable, deliverable: DeliverableTable): DealDeliverableTable {
  return {
    deal_id: deal.id,
    deliverable_id: deliverable.id
  }
}

export async function seedDealDeliverableTable (db: Kysely<Database>, deals: DealTable[], deliverables: DeliverableTable[]) {
  faker.seed(123)

  const deliverableMap: Record<string, DeliverableTable> = {}
  deliverables.forEach(deliverable => { deliverableMap[deliverable.id] = deliverable })

  // Ensures that each deal has 1-3 deliverables; ensure every deliverable is used at most once
  const dealDeliverables = deals.map(deal => {
    const deliverableIds = Object.keys(deliverableMap)
    return faker.helpers.uniqueArray(deliverableIds, faker.datatype.number({ min: 1, max: 3 }))
      .map(deliverableId => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const deliverable = deliverableMap[deliverableId]!
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete deliverableMap[deliverableId]
        return createRandomDealDeliverable(deal, deliverable)
      })
  }).flat(1)

  await db.insertInto('deal_deliverable')
    .values(dealDeliverables)
    .execute()
  return dealDeliverables
}

export async function truncateDealDeliverableTable (db: Kysely<Database>) {
  await db.deleteFrom('deal_deliverable')
    .execute()
}
