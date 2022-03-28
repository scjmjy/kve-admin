import { Middleware } from "koa";

export const responseTime: Middleware = async (ctx, next) => {
    const startTime = Date.now();
    await next();
    const endTime = Date.now();
    console.log(`[Response Time] METHOD = ${ctx.method}, URL = ${ctx.url}, TIME = ${endTime - startTime}ms`);
};
