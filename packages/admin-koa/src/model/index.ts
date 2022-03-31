import type koa from "koa";
import mongoose from "mongoose";
import { seedUsers } from "./seed/user";

export async function setupMongo(app: koa) {
    const { logger } = app.context;
    try {
        await mongoose.connect("mongodb://entryform:33o93o6@localhost:27017/biz");
        logger.debug("[MONGO] Connected to MongoDB Server");
        await seedUsers();
    } catch (err) {
        logger.error("[MONGO] Failed to Connect MongoDB Server", err);
        return Promise.reject();
    }
}
