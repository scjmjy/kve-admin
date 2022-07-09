import type koa from "koa";
import { resolve } from "path";
import config from "config";

interface RedisCfg {
    host: string;
    port: number;
    username?: string;
    password?: string;
    db?: number;
}

export class AppConfig {
    workDir = "";
    isDev = process.env.NODE_ENV === "development";
    listenPort: number;
    keys: string[];
    jwtSecret: string;
    routeDownload: string;
    mongodbConnection: string;
    redisCfg: RedisCfg;
    constructor() {
        this.listenPort = config.get<number>("Server.listenPort");
        this.keys = config.get<string[]>("Server.keys");
        this.jwtSecret = config.get<string>("Server.jwtSecret");
        this.routeDownload = config.get<string>("Server.routeDownload");
        this.mongodbConnection = config.get<string>("MongoDB.connection");
        this.redisCfg = config.get<RedisCfg>("Redis");
    }
}

export const appConfig = new AppConfig();

// export const appConfig: AppConfig = {
//     port: 3000,
//     keys: ["kve123456"],
//     workDir: "",
//     isDev: process.env.NODE_ENV === "development",
//     jwtSecret: "kve123456",
//     // 请替换为自己的 Atlas Cluster 的管理员名称和密码，以及集群名称，以下集群只能读取不能写入
//     mongodbBiz: "mongodb+srv://admin:kve123456@kvers0.ydfnfii.mongodb.net/biz?retryWrites=true&w=majority",
//     mongodbGridFS: "mongodb+srv://admin:kve123456@kvers0.ydfnfii.mongodb.net/gridfs?retryWrites=true&w=majority",
//     // mongodbBiz: "mongodb://admin:kve123456@localhost:27018,localhost:27019,localhost:27020/biz?replSet=kvers0",
//     // mongodbGridFS: "mongodb://admin:kve123456@localhost:27018,localhost:27019,localhost:27020/gridfs?replSet=kvers0",
//     routeDownload: "/api/download/",
//     redis: {
//         host: "127.0.0.1",
//         port: 6379,
//     },
// };

export function setupConfig(app: koa, __dirnameOfIndex: string) {
    appConfig.workDir = resolve(__dirnameOfIndex, "..");
    app.context.config = appConfig;
}
