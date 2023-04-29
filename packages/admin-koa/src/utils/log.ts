import type koa from "koa";
import { EOL } from "os";
import process from "process";
import { resolve } from "path";
import { opendir, readFile, rm } from "fs/promises";
import log4js from "log4js";
import { isSameDay, logCategories, LogCategoryEnum, LogItem } from "admin-common";

export let logDir = "";

export function setupLog(app: koa) {
    const { isDev } = app.context.config;

    logDir = resolve(app.context.config.workDir, "logs");

    log4js.addLayout("json", function (config) {
        return function (logEvent) {
            let data: any = undefined;
            if (logEvent.data.length === 1) {
                // 如果是1个参数，可能是字符串，也可能是 Object
                data = logEvent.data[0];
            } else if (logEvent.data.length > 1) {
                // 如果是多个参数，一般都是字符串，那么拼接起来
                data = logEvent.data.join(" ");
            }
            const logItem: LogItem<any> = {
                INSTANCE: process.env.NODE_APP_INSTANCE,
                categoryName: logEvent.categoryName,
                startTime: logEvent.startTime,
                data: data,
                level: logEvent.level,
                cluster: logEvent.cluster,
            };
            return JSON.stringify(logItem);
        };
    });

    log4js.configure({
        appenders: {
            console: { type: "console", level: "trace" },
            access: {
                layout: { type: "json" },
                type: "dateFile",
                filename: logDir + "/access/access",
                pattern: "yyyy-MM-dd.log",
                alwaysIncludePattern: true,
                level: "trace",
            },
            operation: {
                layout: { type: "json" },
                type: "dateFile",
                filename: logDir + "/operation/operation",
                pattern: "yyyy-MM-dd.log",
                alwaysIncludePattern: true,
                level: "trace",
            },
            debug: {
                layout: { type: "json" },
                type: "dateFile",
                filename: logDir + "/debug/debug",
                pattern: "yyyy-MM-dd.log",
                alwaysIncludePattern: true,
                level: "trace",
            },
        },
        categories: {
            default: { appenders: isDev ? ["console", "debug"] : ["debug"], level: "trace" },
            access: { appenders: isDev ? ["console", "access"] : ["access"], level: "trace" },
            operation: { appenders: isDev ? ["console", "operation"] : ["operation"], level: "trace" },
        },
        pm2: true,
        pm2InstanceVar: "NODE_APP_INSTANCE",
    });
    app.context.logger = {
        debug: log4js.getLogger(),
        access: log4js.getLogger("access"),
        operation: log4js.getLogger("operation"),
    };
    app.context.logger.debug.info("[Log] out dir:", logDir);
}

export async function readAllLogItems(ctx: koa.DefaultContext, category: LogCategoryEnum): Promise<string[]> {
    if (!logCategories.includes(category)) {
        return Promise.reject("请提供日志 category 参数！");
    }
    const path = resolve(logDir, category);
    try {
        const dir = await opendir(path);
        let lines: string[] = [];
        for await (const dirent of dir) {
            if (dirent.isFile()) {
                const fileBuffer = await readFile(resolve(dir.path, dirent.name));
                const fileString = fileBuffer.toString();
                const strArr = fileString.split(EOL);
                if (strArr[strArr.length - 1] === "") {
                    strArr.pop();
                }
                lines = lines.concat(strArr);
            }
        }
        return lines;
    } catch (err) {
        ctx.logger.debug.error("'[Log] readAllLogItems error:", err);
        return [];
    }
}

export async function clearLogItems(ctx: koa.DefaultContext, category: LogCategoryEnum): Promise<void> {
    if (!logCategories.includes(category)) {
        return Promise.reject("请提供日志 category 参数！");
    }
    const path = resolve(logDir, category);
    try {
        const dir = await opendir(path);
        const today = new Date();
        const regex = /\.(\d*-\d*-\d*)\.log/;
        for await (const dirent of dir) {
            if (dirent.isFile()) {
                const match = dirent.name.match(regex);
                if (match) {
                    const logDate = new Date(match[1]);
                    if (isSameDay(today, logDate)) {
                        // 不删除今天的日志文件
                        continue;
                    }
                }
            }
            const filePath = resolve(dir.path, dirent.name);
            await rm(filePath, { recursive: true, force: true });
        }
    } catch (err) {
        ctx.logger.debug.error("'[Log] clearLogItems error:", err);
    }
}
