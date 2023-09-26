import type { Static } from '@sinclair/typebox'

import { FUNCTION } from './environment'
import { launchServer } from './server'
import { migrate } from './migrate'
import type { LoginReply } from './routes/models/auth'

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
export type { ReplyType } from './routes/admin/users/get'
export type { ResultType as AllOrganizationResultType } from './routes/admin/organizations/get'
export type { ResultType as AllPackageResultType } from './routes/admin/packages/get'
export type { ResultType as AllUserResultType } from './routes/admin/users/get'
