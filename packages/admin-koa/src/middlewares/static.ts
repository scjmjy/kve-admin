import type koa from "koa";
import serve from "koa-static";
import { resolve } from "path";
import ms from "ms";

export function setupStatic(app: koa) {
    const { workDir } = app.context.config;
    const publicDir = resolve(workDir, "public");
    app.context.logger.info("[setupStatic] ", publicDir);
    app.use(
        serve(publicDir, {
            maxage: ms("1d"), // 一天
        }),
    );
}
