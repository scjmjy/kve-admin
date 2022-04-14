import type koa from "koa";
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export async function setupMongo(app: koa) {
    mongoosePaginate.paginate.options = {
        customLabels: {
            totalDocs: "total",
            docs: "list",
            limit: "pageSize",
            page: "pageNum",
            prevPage: "pagePre",
            nextPage: "pageNext",
            hasPrevPage: "pageHasPre",
            hasNextPage: "pageHasNext",
            totalPages: "pageTotal",
            pagingCounter: "pageStart",
        },
    };
    const { logger } = app.context;
    try {
        const m = await mongoose.connect("mongodb://biz:33o93o6@localhost:27017/biz");
        logger.debug("[MONGO] Connected to MongoDB Server");
    } catch (err) {
        logger.error("[MONGO] Failed to Connect MongoDB Server", err);
        return Promise.reject();
    }
}
