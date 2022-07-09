import koa from "koa";
import mongoose from "mongoose";
import log4js from "log4js";

export function setupShutdown(app: koa) {
    const { logger } = app.context;
    process.on("SIGINT", function () {
        const p: Promise<any>[] = [];
        p.push(mongoose.disconnect());
        p.push(app.context.redisClient.quit());
        Promise.all(p)
            .then(() => {
                logger.debug.info("Server has gracefully shut down!");
                return 0;
            })
            .catch((err) => {
                logger.debug.info("Server has gracefully shut down with error:", err);
                return 1;
            })
            .then((code: number) => {
                log4js.shutdown((err) => {
                    console.log("[log4js] - shutdown");
                    process.exit(err ? 1 : code);
                });
            });
    });
}
