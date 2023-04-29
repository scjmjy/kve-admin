import type koa from "koa";
import ms from "ms";
import session, { Session } from "koa-session";
import { throwSessionError } from "@/controllers/errors";
import { RouteConsts } from "@/router";

export const SESSION_PREFIX = "session_data:";
export const SessionMaxAge = {
    ms: ms("7d"),
    seconds: ms("7d") / 1000,
};

export interface SessionData {
    loginErrorCount?: number;
    loginErrorTime?: number;
    loginTime: number;
    username: string;
    userId: string;
    ip: string;
    location: string;
    browser: string;
    os: string;
}

export function setupSession(app: koa) {
    app.keys = app.context.config.keys;
    app.use(
        session(
            {
                signed: true,
                key: "kve:sess",
                prefix: SESSION_PREFIX,
                maxAge: SessionMaxAge.ms,
                store: {
                    async set(key, sess, maxAge: number, data) {
                        return app.context.redisClient.set(key, JSON.stringify(sess), "PX", maxAge);
                    },
                    async get(key, maxAge, data: { ctx: any; rolling: boolean }) {
                        const sess = await app.context.redisClient.get(key);
                        // TODO
                        debugger;
                        const { sessionOptions, cookies, path } = data.ctx;
                        if (sess) {
                            return JSON.parse(sess);
                        } else if (path !== RouteConsts.login) {
                            // clean this cookie to ensure next request won't throw again
                            cookies.set(sessionOptions!.key);
                            cookies.set(sessionOptions!.key + ".sig");
                            return throwSessionError("会话已经结束！");
                        }
                    },
                    async destroy(key) {
                        return app.context.redisCache.del(key);
                    },
                },
            },
            app as any,
        ),
    );
}

export async function delSessionData(ctx: koa.DefaultContext) {
    const { sessionOptions, cookies } = ctx;
    const sess = cookies.get(sessionOptions!.key);

    cookies.set(sessionOptions!.key);
    cookies.set(sessionOptions!.key + ".sig");

    if (sess) {
        return await ctx.redisClient.del(sess);
    }
    return Promise.resolve(0);
}

declare module "koa-session" {
    interface Session extends SessionData {}
}
