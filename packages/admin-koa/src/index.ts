import koa from "koa";

import { setupMongo } from "./model";
import { setupRouter } from "./router";
import { setupConfig } from "./utils/config";
import { __dirname } from "./utils/dirname";
import { setupPostMiddlewares, setupPreMiddlewares } from "./middlewares";
import { setupCache } from "@/utils/cache";
import { setupLog } from "@/utils/log";
import { setupShutdown } from "@/utils/shutdown";
import { setupServices } from "./services";

const app = new koa();

async function setup() {
    setupConfig(app, __dirname(import.meta.url));

    setupLog(app);

    await setupCache(app);

    setupServices(app);

    await setupPreMiddlewares(app);

    setupRouter(app);

    setupPostMiddlewares(app);

    await setupMongo(app);

    const { listenPort } = app.context.config;
    const { logger } = app.context;

    app.listen(listenPort, () => {
        logger.debug.info(`[Server] running at port: ${listenPort}`);
    });
    app.on("error", (err) => {
        logger.debug.error(`[Server] error: ${err.message || err}`);
    });

    setupShutdown(app);

    return app;
}

setup().catch((err) => {
    const { logger } = app.context;
    logger.debug.error("[Server] failed to start: ", err);
    process.exit(1);
});

export default app;
