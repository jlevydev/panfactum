import { LoginReply, LoginReplyType } from './login'
import type { FastifyPluginAsync } from 'fastify'
import { DEFAULT_SCHEMA_CODES } from '../constants'
import { getLoginInfo } from '../../util/getLoginInfo'

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
      return getLoginInfo(req)
    }
  )
}
