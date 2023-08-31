import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import type { Database } from './models/Database'
import { readFile, watch } from 'fs/promises'

/*************************************
 * Public function for getting the db instance
 * ***********************************/

let db: Kysely<Database> | null = null
export const getDB = async ():Promise<Kysely<Database>> => {
  if (db === null) {
    await updateDB()
  }

  // If the DB was null, updateDB ensures that it gets updated
  // with a valid db
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return db!
}

/*************************************
 * Logic for refreshing the DB instance when creds change
 * Note: The creds are prone to changing b/c
 * we utilize dynamic credentials provisioned by Vault
 * ***********************************/

// Environment variables
/* eslint-disable */
const credsPath = process.env['PG_CREDS_PATH'] ?? '/not-defined'
const hostName = process.env['PG_HOSTNAME'] ?? 'not-defined'
const pgPort = parseInt(process.env['PG_PORT'] ?? '5432')
const pgDB = process.env['PG_DATABASE'] ?? 'app'
/* eslint-enable */

const passwordPath = `${credsPath}/password`
const getPassword = async (): Promise<string> => {
  return readFile(passwordPath, 'utf-8')
}
const usernamePath = `${credsPath}/username`
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
      host: hostName,
      user: newUsername,
      password: newPassword,
      port: pgPort,
      database: pgDB
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
    const watcher = watch(credsPath, { recursive: true })
    for await (const _ of watcher) {
      await updateDB()
    }
  } catch (err) {
    console.error(err)
  }
})()
void updateDB()
