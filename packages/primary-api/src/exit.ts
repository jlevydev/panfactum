import type { FastifyInstance } from 'fastify'

import { dbDestroyPromise, getDB } from './db/db'
import { NODE_ENV } from './environment'
import { activeSeedingPromise } from './routes/dev/seed'

interface IExitHandlerProps {
  server?: FastifyInstance
}

let isExiting = false
export function registerExitHandlers (props: IExitHandlerProps = {}) {
  const {
    server
  } = props

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM signal..')

    if (isExiting) {
      console.log('Already exiting. Waiting for prior handler to complete.')
      return
    } else {
      isExiting = true
    }

    // Ensures that we eventually exit; exit with 1
    // to show that cleanup was not successful
    setTimeout(() => {
      process.exit(1)
    }, 1000 * 60 * 15)

    // close the http server
    if (server) {
      await server.close()
    }

    if (activeSeedingPromise !== null) {
      console.log('Delaying process exit until data seeding is completed...')
      try {
        await activeSeedingPromise
      } catch (e) {
        console.error('Data seeding failed. Continuing to exit.')
        console.error(e)
      }
    }

    if (dbDestroyPromise !== null && NODE_ENV !== 'development') {
      console.log('Delaying process exit until old DB connections are closed...')
      try {
        await dbDestroyPromise
      } catch (e) {
        console.error('Closing old database connections failed. Continuing to exit.')
        console.error(e)
      }
    }

    // Close the database connections so that
    // we do not leave any dangling queries
    try {
      console.log('Closing current database connections...')
      const db = await getDB()
      await db.destroy()
    } catch (e) {
      console.error('Closing current database connections failed. Continuing to exit.')
      console.error(e)
    }

    process.exit(0)
  })
}
