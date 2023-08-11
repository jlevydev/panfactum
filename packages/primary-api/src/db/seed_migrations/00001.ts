import type { Kysely } from 'kysely'
import type { Database } from '../models/Database'
import { seedUserTable, truncateUserTable } from '../models/User.seed'
import { seedOrganizationTable, truncateOrganizationTable } from '../models/Organization.seed'
import { seedUserOrganizationTable, truncateUserOrganizationTable } from '../models/UserOrganization.seed'
import { seedUserLoginSessionTable, truncateLoginSessionTable } from '../models/UserLoginSession.seed'
import { seedBrandTable, truncateBrandTable } from '../models/Brand.seed'
import { seedDeliverableTable, truncateDeliverableTable } from '../models/Deliverable.seed'
import { seedContractTable, truncateContractTable } from '../models/Contract.seed'
import { seedReachSnapshotTable, truncateReachSnapshotTable } from '../models/ReachSnapshot.seed'
import { seedIndustryTable, truncateIndustryTable } from '../models/Industry.seed'
import { seedDealTable } from '../models/Deal.seed'
import { seedDealDeliverableTable } from '../models/DealDeliverable.seed'
import { seedDealContractTable, truncateDealContractTable } from '../models/DealContract.seed'

export async function up (db: Kysely<Database>): Promise<void> {
  const users = await seedUserTable(db)
  await seedUserLoginSessionTable(db, users)
  const organizations = await seedOrganizationTable(db)
  await seedUserOrganizationTable(db, users, organizations)
  const industries = await seedIndustryTable(db)
  const brands = await seedBrandTable(db)
  const deliverables = await seedDeliverableTable(db)
  const contracts = await seedContractTable(db)
  const snapshots = await seedReachSnapshotTable(db, organizations)
  const deals = await seedDealTable(db, organizations, brands, snapshots, industries)
  await seedDealDeliverableTable(db, deals, deliverables)
  await seedDealContractTable(db, deals, contracts)
}

export async function down (db: Kysely<Database>): Promise<void> {
  await truncateDealContractTable(db)
  await truncateDeliverableTable(db)
  await truncateReachSnapshotTable(db)
  await truncateContractTable(db)
  await truncateDeliverableTable(db)
  await truncateBrandTable(db)
  await truncateIndustryTable(db)
  await truncateUserOrganizationTable(db)
  await truncateOrganizationTable(db)
  await truncateLoginSessionTable(db)
  await truncateUserTable(db)
}
