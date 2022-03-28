import { ParameterizedContext } from "koa";

export function error404(ctx: ParameterizedContext) {
    ctx.response.status = 404;
    ctx.response.body = "404 Error";
}
