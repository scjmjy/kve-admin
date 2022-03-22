import koa from "koa";
import Bodyparser from "koa-bodyparser";
import {router} from "./router";

import { responseTime } from "./middlewares/response-time";

const app = new koa();
const port = 3000;

app.use(responseTime).use(Bodyparser()).use(router.routes());

app.listen(port, () => {
    console.log(`Server is running at port: ${port}`);
});
