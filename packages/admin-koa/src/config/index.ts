import type koa from "koa";
import { resolve } from "path";
import { AppConfig } from "@/types/koa";

export const appConfig: AppConfig = {
    keys: ['kve123456'],
    workDir: "",
    isDev: process.env.NODE_ENV === "development",
    jwtSecret: "kve123456",
    // 请替换为自己的 Atlas Cluster 的管理员名称和密码，以及集群名称，以下集群只能读取不能写入
    mongodbBiz: "mongodb+srv://admin:kve123456@kvers0.ydfnfii.mongodb.net/biz?retryWrites=true&w=majority",
    mongodbGridFs: "mongodb+srv://admin:kve123456@kvers0.ydfnfii.mongodb.net/gridfs?retryWrites=true&w=majority",
    // mongodbBiz: "mongodb://admin:kve123456@localhost:27018,localhost:27019,localhost:27020/biz?replSet=kvers0",
    // mongodbGridFs: "mongodb://admin:kve123456@localhost:27018,localhost:27019,localhost:27020/gridfs?replSet=kvers0",
    routeDownload: "/api/download/",
    port: 3000,
    redis: {
        host: "127.0.0.1",
        port: 6379,
    },
};

export function setupConfig(app: koa, __dirnameOfIndex: string) {
    appConfig.workDir = resolve(__dirnameOfIndex, "..");
    app.context.config = appConfig;
}
