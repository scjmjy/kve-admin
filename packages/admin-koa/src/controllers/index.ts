import { ParameterizedContext } from "koa";
import { getIndexHtml } from "../views/index.js";

export function indexHandler(ctx: ParameterizedContext) {
    ctx.response.status = 200;
    ctx.response.type = "text/html";
    ctx.response.body = getIndexHtml("Koa Demo");
}
