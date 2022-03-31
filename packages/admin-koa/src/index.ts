import koa from "koa";
import bodyparser from "koa-bodyparser";
import cors from "@koa/cors";

import { setupStatic } from "./middlewares/static";
import { responseTime } from "./middlewares/response-time";
import { errorMiddleware } from "./middlewares/error";

import { setupMongo } from "./model";
import { setupSession } from "./session";
import { setupRouter } from "./router";
import { setupLog } from "./middlewares/log";
import { setupConfig } from "./config";

const app = new koa();
const port = 3000;

setupConfig(app, __dirname);

setupLog(app);

app.use(cors());

setupSession(app);

setupStatic(app);

app.use(errorMiddleware).use(responseTime).use(bodyparser());

setupRouter(app);

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
