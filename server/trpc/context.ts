import * as trpcExpress from '@trpc/server/adapters/express';
import { inferAsyncReturnType, TRPCError } from '@trpc/server';
import { verify, VerifyOptions } from 'jsonwebtoken';
interface contextToken {
    token: any,
    user: any
}

// created for each request
export const createContext = ({
    req
}: trpcExpress.CreateExpressContextOptions) => {
    try {
        const { headers: { cookies }, cookies: { token } } = req

        const validateToken = cookies !== 'undefined' && cookies !== undefined ? cookies : token

        const options: VerifyOptions = {
            algorithms: ['HS256'], // specify the allowed algorithms
        };

        const user = verify(validateToken, `${process.env.secret}`, options)

        const result: contextToken = {
            // cookies: req.cookies.token
            token: validateToken,
            user
        }
        return result
    } catch (error) {
        return { user: 111 }
        // throw new TRPCError({ code: 'UNAUTHORIZED' });
    }


}
    ; // no context
export type Context = inferAsyncReturnType<typeof createContext>;