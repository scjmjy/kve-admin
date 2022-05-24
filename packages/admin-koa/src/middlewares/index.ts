import type koa from "koa";
import cors from "@koa/cors";
import bodyparser from "koa-bodyparser";
import { responseTime } from "./response-time";
import { error404, errorMiddleware } from "./error";
import { setupLog } from "./log";
import { setupStatic } from "./static";
import { setupSession } from "./session";

export function setupPreMiddlewares(app: koa) {
    app.use(cors());
    setupLog(app);
    setupSession(app);
    setupStatic(app);
    app.use(errorMiddleware).use(responseTime).use(bodyparser());
}

export function setupPostMiddlewares(app: koa) {
    app.use(error404);
}
