import Router from "koa-router";
import { PERM_CODES } from "admin-common";
import { hasPerm } from "@/middlewares/permission";
import { clearCache, getCacheInfo } from "@/controllers/cache";
import { getMetrics } from "@/controllers/metric";

export const monitorRouter = new Router<any, any>({
    prefix: "/monitor",
});

const hasPerm_monitor = hasPerm(PERM_CODES.monitor);
const hasPerm_cachemanage = hasPerm(PERM_CODES.monitor_cachemanage);
const hasPerm_cachemanage_clear = hasPerm(PERM_CODES.monitor_cachemanage_clear);
const hasPerm_metric = hasPerm(PERM_CODES.monitor_metric);

monitorRouter
    .use(hasPerm_monitor)
    .get("/cache", hasPerm_cachemanage, getCacheInfo)
    .delete("/cache", hasPerm_cachemanage, hasPerm_cachemanage_clear, clearCache)
    .get("/metric", hasPerm_metric, getMetrics);
