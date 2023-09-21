import type { Static } from '@sinclair/typebox'

import type { LoginReply } from './routes/auth/login'

import { FUNCTION } from './environment'
import { launchServer } from './server'
import { migrate } from './migrate'

if (FUNCTION === 'http-server') {
  launchServer()
} else if (FUNCTION === 'db-migrate') {
  void migrate()
}

/********************************************************************
 * Test Exports
 *******************************************************************/

export type LoginReturnType = Static<typeof LoginReply>
export type { UserOrganizationsReplyType } from './routes/user/organizations'
export type { UserType } from './routes/admin/users/types'
export type { GetUsersReplyType } from './routes/admin/users/get'
