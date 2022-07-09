import type koa from "koa";
import mongoose from "mongoose";

export async function setupMongo(app: koa) {
    const { logger } = app.context;
    try {
        await mongoose.connect(app.context.config.mongodbConnection, {
            dbName: "biz",
        });
        logger.debug.info("[MongoDB] Connected to MongoDB Server");
    } catch (err: any) {
        logger.debug.error("[MongoDB] Failed to Connect MongoDB Server: ", err.message);
        return Promise.reject("Failed to Connect MongoDB");
    }
}
