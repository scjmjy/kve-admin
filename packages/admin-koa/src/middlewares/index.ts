import type koa from "koa";
import cors from "@koa/cors";
import { responseTime } from "./response-time";
import { error404, errorMiddleware } from "./error";
import { setupLog } from "./log";
import { setupStatic } from "./static";
import { setupSession } from "./session";
import { setupLimiter } from "./limiter";

export function setupPreMiddlewares(app: koa) {
    app.use(errorMiddleware).use(responseTime);
    app.use(cors());
    setupLog(app);
    setupStatic(app);
    setupSession(app);
    setupLimiter(app);
}

export function setupPostMiddlewares(app: koa) {
    app.use(error404);
}
