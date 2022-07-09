import type koa from "koa";
import cors from "@koa/cors";
import { responseTime } from "./response-time";
import { error404, errorMiddleware } from "./error";
import { setupStatic } from "./static";
import { setupSession } from "./session";
import { setupLimiter } from "./limiter";
import { setupUpload } from "./upload";

export async function setupPreMiddlewares(app: koa) {
    app.use(cors());
    setupStatic(app);
    app.use(responseTime).use(errorMiddleware);
    setupSession(app);
    setupLimiter(app);
    await setupUpload(app);
}

export function setupPostMiddlewares(app: koa) {
    app.use(error404);
}
