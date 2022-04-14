import koa from "koa";

import { setupMongo } from "./model";
import { setupRouter } from "./router";
import { setupConfig } from "./config";
import { __dirname } from "./utils/dirname";
import { setupPostMiddlewares, setupPreMiddlewares } from "./middlewares";

const app = new koa();
const port = 3000;

setupConfig(app, __dirname(import.meta.url));

setupPreMiddlewares(app);

setupRouter(app);

setupPostMiddlewares(app);

setupMongo(app)
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running at port: ${port}`);
        });
    })
    .catch(() => {
        process.exit(1);
    });

// app.on("error", (err) => {
//     console.error("server error", err);
// });
