import type koa from "koa";
import { resolve } from "path";
import { AppConfig } from "@/types/koa";

export const appConfig: AppConfig = {
    workDir: "",
    isDev: process.env.NODE_ENV === "development",
    jwtSecret: "123456",
    mongodbBiz: "mongodb://biz:33o93o6@localhost:27017/biz",
    mongodbGridFs: "mongodb://gridfs:33o93o6@localhost:27017/gridfs",
    route_download: "/api/download/",
};

export function setupConfig(app: koa, __dirnameOfIndex: string) {
    // console.log("[setupConfig]", __dirnameOfIndex);
    appConfig.workDir = resolve(__dirnameOfIndex, "..");
    app.context.config = appConfig;
}
