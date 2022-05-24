import type koa from "koa";
import mongoose from "mongoose";

export async function setupMongo(app: koa) {
    const { logger } = app.context;
    try {
        const m = await mongoose.connect(app.context.config.mongodbBiz);
        logger.debug("[MONGO] Connected to MongoDB Server");
    } catch (err) {
        logger.error("[MONGO] Failed to Connect MongoDB Server", err);
        return Promise.reject();
    }
}
