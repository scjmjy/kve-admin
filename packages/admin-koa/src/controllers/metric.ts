import { StatusCodes } from "http-status-codes";
import { MetricTimelines, LogCategoryEnum, PERM_CODES } from "admin-common";
import { throwPermissionError } from "@/controllers/errors";
import { hasPermFn } from "@/middlewares/permission";
import { getAllMetrics } from "@/utils/metrics";
import { readAllLogItems, clearLogItems } from "@/utils/log";

export async function getMetrics(ctx: KoaAjaxContext<void, MetricTimelines>) {
    const metrics = await getAllMetrics();

    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        data: metrics,
    };
}

export async function getLogItems(ctx: KoaAjaxContext<void, string[], { category: LogCategoryEnum }>) {
    const result = await readAllLogItems(ctx, ctx.params.category);

    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        data: result,
    };
}

export async function clearLog(ctx: KoaAjaxContext<void, string[], { category: LogCategoryEnum }>) {
    const { category } = ctx.params;
    let permCode = "";
    switch (category) {
        case "access":
            permCode = PERM_CODES.monitor_log_clearAccess;
            break;
        case "operation":
            permCode = PERM_CODES.monitor_log_clearOp;
            break;
        case "debug":
            permCode = PERM_CODES.monitor_log_clearDebug;
            break;
    }

    const pass = await hasPermFn(ctx, permCode, "every");
    if (!pass) {
        return throwPermissionError("无权进行此操作！", "NOTIFICATION");
    }

    await clearLogItems(ctx, category);

    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: "日志清空成功！",
    };
}
