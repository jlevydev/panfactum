import type {RouteOptions} from "fastify";
import {Static, Type} from "@sinclair/typebox";

export const HealthzReturnType = Type.Object({
  status: Type.String()
})
export const HealthzRoute: RouteOptions = {
    method: 'GET',
    url: '/healthz',
    handler: async (_, res): Promise<Static<typeof HealthzReturnType>> => {
        res.statusCode = 200
        return {
          status: "goodss"
        }
    },
    schema: {
        response: {
            200: HealthzReturnType
        }
    }
}
