import koa from "koa";
import Bodyparser from "koa-bodyparser";
import Router from "koa-router";

import jwt from "koa-jwt";

import { responseTime } from "./middlewares/response-time.js";
import { __resolve } from "./utils/dirname.js";

interface HbsContext {
    render(tpl: string, locals?: { [key: string]: any }): Promise<void>;
}

const app = new koa<void, HbsContext>();
const port = 3000;
const jwtSecret = "123456";

const router = new Router<void, HbsContext>();

router.get("/", function (ctx, next) {
    ctx.body = "Index Page";
});

app.use(responseTime).use(Bodyparser()).use(router.routes());

app.listen(port, () => {
    console.log(`Server is running at port: ${port}`);
});
