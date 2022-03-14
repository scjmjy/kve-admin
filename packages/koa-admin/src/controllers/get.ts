import { ParameterizedContext } from "koa";

export function getHandler(ctx: ParameterizedContext) {
    const { url, method } = ctx;
    ctx.response.status = 200;
    ctx.response.type = "application/json";
    ctx.response.body = {
        url,
        method,
    };
}
