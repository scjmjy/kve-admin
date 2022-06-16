import koa from "koa";

import { setupMongo } from "./model";
import { setupRouter } from "./router";
import { setupConfig } from "./config";
import { __dirname } from "./utils/dirname";
import { setupPostMiddlewares, setupPreMiddlewares } from "./middlewares";
import { setupCache } from "./cache";

const app = new koa();

setupConfig(app, __dirname(import.meta.url));

setupCache(app);

setupPreMiddlewares(app);

setupRouter(app);

setupPostMiddlewares(app);

setupMongo(app)
    .then(() => {
        app.listen(app.context.config.port, () => {
            console.log(`Server is running at port: ${app.context.config.port}`);
        });
    })
    .catch(() => {
        console.error("Server failed to start!");
        process.exit(1);
    });
