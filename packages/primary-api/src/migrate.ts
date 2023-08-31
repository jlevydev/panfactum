import * as path from 'path'
import { promises as fs } from 'fs'
import {
  Migrator,
  FileMigrationProvider
} from 'kysely'
import { getDB } from './db/db'

// Environment variables
/* eslint-disable */
const NODE_ENV = process.env['NODE_ENV'] ?? 'development'
/* eslint-enable */

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
  const migrator = new Migrator({
    db: await getDB(),
    migrationTableName: 'kysely_seed',
    migrationLockTableName: 'kysely_seed_lock',
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.resolve(__dirname, 'db/seed_migrations')
    })
  })

  if (NODE_ENV === 'development') {
    // When we are doing development, always drop the last
    // migration before migrating to latest to allow us to test out seed
    // changes rapidly
    const migrations = await migrator.getMigrations()
    if (migrations.length > 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await migrator.migrateTo(migrations[migrations.length - 1]!.name)
    } else {
      await migrator.migrateDown()
    }

    console.log('Successfully reverted last data seeding')
  }

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`Data seeding migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`Failed to seed data "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error('Failed to seed data')
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw error
  }
}

export async function run () {
  // If in local development, we want to run the seed data
  // migration AFTER the schema updates to ensure that the database is populated
  if (NODE_ENV === 'development') {
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
