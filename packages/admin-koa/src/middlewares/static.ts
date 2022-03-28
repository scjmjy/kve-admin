import koastatic from "koa-static";
import { resolve } from "path";

export const serve = koastatic(resolve(__dirname, "../../", "public"), {
    maxage: 1000 * 60 * 60 * 24, // 一天
    setHeaders(res, path, stats) {
        // res.setHeader("Access-Control-Allow-Origin", "http://localhost:4400/");
        // res.setHeader("Access-Control-Allow-Origin", "");
        // res.setHeader("Vary", "Origin");
    },
});
