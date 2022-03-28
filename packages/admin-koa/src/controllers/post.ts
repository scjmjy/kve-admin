import { ParameterizedContext } from "koa";

export function postHandler(ctx: ParameterizedContext) {
    const { url, method, request } = ctx;
    ctx.status = 200;
    ctx.type = "application/json";
    
    ctx.body = {
        url,
        method,
        body: request.body,
    };
}
