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
    browser: string;
    os: string;
}

export function setupSession(app: koa) {
    app.keys = app.context.config.keys;
    app.use(
        session(
            {
                signed: true,
                prefix: SESSION_PREFIX,
                maxAge: SessionMaxAge.ms,
                store: {
                    async set(key, sess, maxAge, data) {
                        return app.context.redisCache.set(key, sess, {
                            ttl: typeof maxAge === "number" ? maxAge / 1000 : -1,
                        });
                    },
                    async get(key, maxAge, data: { ctx: koa.ExtendableContext; rolling: boolean }) {
                        const sess = await app.context.redisCache.get<Session>(key);
                        const { sessionOptions, cookies, path } = data.ctx;
                        if (sess) {
                            //
                        } else if (path !== RouteConsts.login) {
                            // clean this cookie to ensure next request won't throw again
                            cookies.set(sessionOptions!.key);
                            cookies.set(sessionOptions!.key + ".sig");
                            return throwSessionError("会话已经结束！");
                        }
                        return sess;
                    },
                    async destroy(key) {
                        return app.context.redisCache.del(key);
                    },
                },
            },
            app,
        ),
    );
}

declare module "koa-session" {
    interface Session extends SessionData {}
}
