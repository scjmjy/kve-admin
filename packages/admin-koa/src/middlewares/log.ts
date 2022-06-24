import { resolve } from "path";
import type koa from "koa";
import log4js from "log4js";

export let logDir = "";

export function setupLog(app: koa) {
    const { isDev } = app.context.config;

    logDir = resolve(app.context.config.workDir, "logs");

    log4js.configure({
        appenders: {
            dev: {
                type: "console",
                level: "trace",
            },
            prd: {
                type: "dateFile",
                filename: logDir + "/applog",
                pattern: "yyyy-MM-dd.log",
                alwaysIncludePattern: true,
                level: "info",
            },
        },
        categories: {
            default: {
                appenders: [isDev ? "dev" : "prd"],
                level: "trace",
            },
            AccessLog: {
                appenders: [isDev ? "dev" : "prd"],
                level: "trace",
            },
        },
    });
    app.context.logger = log4js.getLogger();
    app.context.loggerAccess = log4js.getLogger("AccessLog");
    app.context.logger.info("[LogDir] ", logDir);
}
