import express, { NextFunction, Request, Response } from "express";
import next from "next";
import "dotenv/config";
import { errLoggerCustom, log, resLoggerCustom } from "../utils/log4js";
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from "./trpcRouter";
import { createContext } from "./trpc/context";
import cookieParser from "cookie-parser";
import bodyParser from 'body-parser';
const { xss } = require('express-xss-sanitizer')
import cacheControl from 'express-cache-controller'
import { expressjwt } from 'express-jwt'

const { env: {
    PORT,
    isProd,
    secret
} } = process

const port = PORT || 3000;


const app = next({ dev: true });
const handle = app.getRequestHandler();

(async () => {
    try {
        await app.prepare();
        const server = express();
        server.use(bodyParser.urlencoded({ extended: false }))
        server.use(bodyParser.json())
        server.use(xss())
        server.use(cookieParser())
        server.use(cacheControl({
            private: true
        }))

        // 通过log4js记录访问日志
        server.use(async (req, res, next) => {
            const start = new Date()
            await next()
            const end = new Date()
            const duration = end.valueOf() - start.valueOf()
            if (isProd === 'true') {
                resLoggerCustom(req, res, duration)
                console.log((`${req.method} ${req.url} - ${duration}ms`))
            } else {
                log.info(`${req.method} ${req.url} - ${duration}ms`)
            }
        })

        server.use(
            expressjwt({
                secret: `${secret}`,
                algorithms: ["HS256"],
                getToken: (req: any) => {
                    const { headers: { authorization }, cookies: { token } } = req
                    if (authorization && authorization.split(" ")[0] === "Bearer") {
                        return authorization.split(" ")[1];
                    } else if (token) {
                        return token
                    }
                    return ''
                }
            })
        )

        server.use(
            '/api/v1',
            trpcExpress.createExpressMiddleware({
                router: appRouter,
                createContext,
                onError: ({ error }: any) => {
                    console.log(error, 'error');
                }
            }),
        )

        server.all("*", (req: Request, res: Response) => {
            handle(req, res)
        })

        server.listen(port, (err?: any) => {
            if (err) throw err;
            console.log(`> Ready on localhost:${port} - env ${process.env.NODE_ENV}`);
        })

        server.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            if (isProd === 'true') {
                errLoggerCustom(req, res, err);
                log.error(`${req.method} ${req.url}`, err)
            } else {
                console.error(`${req.method} ${req.url}`, err)
            }
            next(err)
        })

    } catch (error) {

    }

}
)();
