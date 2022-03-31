import { Middleware } from "koa";

export const responseTime: Middleware = async (ctx, next) => {
    const startTime = Date.now();
    await next();
    const endTime = Date.now();
    ctx.loggerAccess.info(
        `[Response Time] ORIGIN = ${ctx.request.origin}, METHOD = ${ctx.method}, URL = ${ctx.url}, TIME = ${
            endTime - startTime
        }ms`,
    );
};