import type { FastifyPluginAsync } from 'fastify'

import { getUserInfoById } from '../../db/queries/getUserInfoById'
import { DEFAULT_SCHEMA_CODES } from '../../handlers/error'
import { getAuthInfo } from '../../util/getAuthInfo'
import type { LoginReplyType } from '../models/auth'
import { LoginReply } from '../models/auth'

/**********************************************************************
 * Route Logic
 **********************************************************************/

export const AuthInfoRoute:FastifyPluginAsync = async (fastify) => {
  fastify.get<{Reply: LoginReplyType}>(
    '/info',
    {
      schema: {
        response: {
          200: LoginReply,
          ...DEFAULT_SCHEMA_CODES
        }
      }
    },
    async (req) => {
      const { masqueradingUserId, userId, loginSessionId } = getAuthInfo(req)
      const userInfo = await getUserInfoById(userId)

      if (masqueradingUserId === null) {
        return {
          userId,
          loginSessionId,
          ...userInfo
        }
      } else {
        const { panfactumRole } = await getUserInfoById(masqueradingUserId)
        if (panfactumRole === null) {
          throw new Error('The panfactumRole of a masquerading user should never be null!')
        }
        return {
          userId,
          loginSessionId,
          ...userInfo,
          masqueradingUserId,
          masqueradingPanfactumRole: panfactumRole
        }
      }
    }
  )
}
