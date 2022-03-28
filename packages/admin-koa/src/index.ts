import koa from "koa";
import Bodyparser from "koa-bodyparser";
import cors from "@koa/cors";

import { router } from "./router";

import { serve } from "./middlewares/static";
import { responseTime } from "./middlewares/response-time";
import { errorMiddleware } from "./middlewares/error";

import { initMongo } from "./model";

const app = new koa();
const port = 3000;

// app.on("error", (err) => {
//     console.error("server error", err);
// });

app.use(cors());
app.use(serve);
app.use(errorMiddleware).use(responseTime).use(Bodyparser()).use(router.routes()).use(router.allowedMethods());

initMongo()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running at port: ${port}`);
        });
    })
    .catch(() => {
        process.exit(1);
    });
