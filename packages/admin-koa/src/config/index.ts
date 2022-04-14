import { resolve } from "path";
import type koa from "koa";

export function setupConfig(app: koa, __dirnameOfIndex: string) {
    console.log("[setupConfig]", __dirnameOfIndex);
    
    app.context.config = {
        rootDir: resolve(__dirnameOfIndex, ".."),
        dev: process.env.NODE_ENV === "development",
    };
}

interface AppConfig {
    rootDir: string;
    dev: boolean;
}

declare module "koa" {
    interface BaseContext {
        config: AppConfig;
    }
}
