import type { Kysely } from 'kysely'
import type { Database } from '../models/Database'
import { seedUserTable, truncateUserTable } from '../models/User.seed'
import { seedOrganizationTable, truncateOrganizationTable } from '../models/Organization.seed'
import { seedUserOrganizationTable, truncateUserOrganizationTable } from '../models/UserOrganization.seed'
import { seedUserLoginSessionTable, truncateLoginSessionTable } from '../models/UserLoginSession.seed'

export async function up (db: Kysely<Database>): Promise<void> {
  const users = await seedUserTable(db)
  await seedUserLoginSessionTable(db, users)
  const organizations = await seedOrganizationTable(db)
  await seedUserOrganizationTable(db, users, organizations)
}

export async function down (db: Kysely<Database>): Promise<void> {
  await truncateUserOrganizationTable(db)
  await truncateOrganizationTable(db)
  await truncateLoginSessionTable(db)
  await truncateUserTable(db)
}
