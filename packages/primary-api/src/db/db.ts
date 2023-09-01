import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import type { Database } from './models/Database'
import { readFile, watch } from 'fs/promises'
import { PG_CREDS_PATH, PG_DATABASE, PG_HOSTNAME, PG_PORT } from '../environment'

/*************************************
 * Public function for getting the db instance
 * ***********************************/

let db: Kysely<Database> | null = null
export const getDB = async ():Promise<Kysely<Database>> => {
  // If the DB was null, updateDB ensures that it gets updated
  // with a valid db
  if (db === null) {
    await updateDB()
  }

  // If the DB is still null, something has gone terribly wrong!
  if (db === null) {
    throw new Error('Database was not properly initialized (db is null)!')
  }

  return db
}

/*************************************
 * Logic for refreshing the DB instance when creds change
 * Note: The creds are prone to changing b/c
 * we utilize dynamic credentials provisioned by Vault
 * ***********************************/

const passwordPath = `${PG_CREDS_PATH}/password`
const getPassword = async (): Promise<string> => {
  return readFile(passwordPath, 'utf-8')
}
const usernamePath = `${PG_CREDS_PATH}/username`
const getUsername = async (): Promise<string> => {
  return readFile(usernamePath, 'utf-8')
}

// Updates the db returned from getDB above
let username: string | null = null
let password: string | null = null
const updateDB = async () => {
  const newUsername = await getUsername()
  const newPassword = await getPassword()

  // If the username and password have changed, swap out the db
  if (db === null || newUsername !== username || newPassword !== password) {
    console.log(`Found new postgres username and password (${newUsername}). Updating DB...`)
    const postgresPool = new Pool({
      host: PG_HOSTNAME,
      user: newUsername,
      password: newPassword,
      port: PG_PORT,
      database: PG_DATABASE
    })

    // Close the old connections after a minute
    // to allow running queries to complete
    setTimeout(() => {
      void db?.destroy()
    }, 60 * 1000)

    db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool: postgresPool
      })
    })
    username = newUsername
    password = newPassword
  }
}

// Installs a watcher in the creds directory that will update
// db if the file changes
void (async () => {
  try {
    const watcher = watch(PG_CREDS_PATH, { recursive: true })
    for await (const _ of watcher) {
      await updateDB()
    }
  } catch (err) {
    console.error(err)
  }
})()
void updateDB()
