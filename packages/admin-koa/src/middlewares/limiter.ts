import type koa from "koa";
import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";

export function setupLimiter(app: koa) {
    const rateLimiter = new RateLimiterRedis({
        storeClient: app.context.redisClient,
        keyPrefix: "koa-limiter",
        points: 30, // 30 requests for ctx.ip
        duration: 10, // per 10 seconds
    });

    function setLimiterHeaders(ctx: koa.BaseContext, limiterRes: RateLimiterRes) {
        const headers = {
            "Retry-After": (limiterRes.msBeforeNext / 1000).toString(),
            "X-RateLimit-Limit": `${rateLimiter.points}/${rateLimiter.duration}`,
            "X-RateLimit-Remaining": limiterRes.remainingPoints.toString(),
            "X-RateLimit-Reset": new Date(Date.now() + limiterRes.msBeforeNext).toLocaleString(),
        };
        ctx.set(headers);
    }

    app.use(async (ctx: KoaAjaxContext<void>, next) => {
        try {
            const limiterRes = await rateLimiter.consume(ctx.ip);
            // setLimiterHeaders(ctx, limiterRes);
        } catch (rejRes) {
            if (rejRes instanceof RateLimiterRes) {
                setLimiterHeaders(ctx, rejRes);
            }
            ctx.status = 429;
            ctx.body = {
                code: ctx.status,
                msg: "太多次的请求！",
                showType: "NOTIFICATION",
            };
            return;
        }

        await next();
    });
}
