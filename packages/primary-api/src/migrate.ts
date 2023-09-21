import * as path from 'path'
import { promises as fs } from 'fs'
import {
  Migrator,
  FileMigrationProvider
} from 'kysely'
import { getDB } from './db/db'

export async function migrateToLatest (revertLast = false) {
  const migrator = new Migrator({
    db: await getDB(),
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.resolve(__dirname, 'db/migrations')
    })
  })

  // Allows us to drop the last
  // migration before migrating to latest to allow us to test out schema
  // changes rapidly
  if (revertLast) {
    const migrations = await migrator.getMigrations()
    if (migrations.length > 1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const previousMigration = migrations[migrations.length - 2]!.name
      const { error } = await migrator.migrateTo(previousMigration)
      if (error) {
        throw error
      } else {
        console.log(`Successfully reverted to schema migration ${previousMigration}`)
      }
    } else {
      const { error } = await migrator.migrateDown()
      if (error) {
        throw error
      } else {
        console.log('Successfully reverted all schema migrations')
      }
    }
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

  console.log('Migrations completed successfully')
}

export async function migrate () {
  await migrateToLatest()
  await getDB().then(db => db.destroy())
  process.exit(0)
}
