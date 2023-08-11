import { faker } from '@faker-js/faker'
import type { Kysely } from 'kysely'
import type { Database } from './Database'
import type { DealContractTable } from './DealContract'
import type { DealTable } from './Deal'
import type { ContractTable } from './Contract'

export function createRandomDealContract (deal: DealTable, contract: ContractTable, version: number): DealContractTable {
  return {
    deal_id: deal.id,
    contract_id: contract.id,
    version
  }
}

export async function seedDealContractTable (db: Kysely<Database>, deals: DealTable[], contracts: ContractTable[]) {
  faker.seed(123)

  const contractsMap: Record<string, ContractTable> = {}
  contracts.forEach(contract => { contractsMap[contract.id] = contract })

  // Ensures that each deal has 1-3 contracts; ensure every contract is used at most once
  const dealContracts = deals.map(deal => {
    const contractIds = Object.keys(contractsMap)
    return faker.helpers.uniqueArray(contractIds, faker.datatype.number({ min: 1, max: 3 }))
      .map((contractId, i) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const contract = contractsMap[contractId]!
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete contractsMap[contractId]
        return createRandomDealContract(deal, contract, i)
      })
  }).flat(1)

  await db.insertInto('deal_contract')
    .values(dealContracts)
    .execute()
  return dealContracts
}

export async function truncateDealContractTable (db: Kysely<Database>) {
  await db.deleteFrom('deal_contract')
    .execute()
}
