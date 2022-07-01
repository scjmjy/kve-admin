import { StatusCodes } from "http-status-codes";
import { MetricTimelines } from "admin-common";
import { KoaAjaxContext } from "@/types/koa";
import { getAllMetrics } from "@/utils/metrics";

export async function getMetrics(ctx: KoaAjaxContext<void, MetricTimelines>) {
    const metrics = await getAllMetrics();

    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        data: metrics,
    };
}
