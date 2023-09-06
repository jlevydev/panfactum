import * as path from 'path'
import { promises as fs } from 'fs'
import {
  Migrator,
  FileMigrationProvider
} from 'kysely'
import { getDB } from './db/db'
import { ENV, NODE_ENV } from './environment'
import { populateData, truncateData } from './db/seed'

export async function migrateToLatest () {
  const migrator = new Migrator({
    db: await getDB(),
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.resolve(__dirname, 'db/migrations')
    })
  })

  if (NODE_ENV === 'development') {
    // When we are doing development, always drop the last
    // migration before migrating to latest to allow us to test out schema
    // changes rapidly
    const migrations = await migrator.getMigrations()
    if (migrations.length > 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await migrator.migrateTo(migrations[migrations.length - 1]!.name)
    } else {
      await migrator.migrateDown()
    }

    console.log('Successfully reverted last schema migration')
  }

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`Schema migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`Failed to execute schema migration "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error('Failed to migrate schemas')
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw error
  }
}

export async function seedData () {
  const db = await getDB()
  await truncateData(db)
  await populateData(db)
}

export async function run () {
  // In development environments, we want to run the seed data
  // migration AFTER the schema updates to ensure that the database is populated
  // with some test data
  if (NODE_ENV === 'development' || ENV === 'development') {
    await migrateToLatest()
    await seedData()
  } else {
    await migrateToLatest()
  }

  console.log('Migrations completed successfully')
  await getDB().then(db => db.destroy())
  process.exit(0)
}

void run()
