import type koa from "koa";
import serve from "koa-static";
import { resolve } from "path";
import ms from "ms";

export function setupStatic(app: koa) {
    const { rootDir } = app.context.config;
    const publicDir = resolve(rootDir, "public");
    app.context.logger.info("[STATIC] ", publicDir);
    app.use(
        serve(publicDir, {
            maxage: ms("1d"), // 一天
            setHeaders(res, path, stats) {
                // res.setHeader("Access-Control-Allow-Origin", "http://localhost:4400/");
                // res.setHeader("Access-Control-Allow-Origin", "");
                // res.setHeader("Vary", "Origin");
            },
        }),
    );
}
