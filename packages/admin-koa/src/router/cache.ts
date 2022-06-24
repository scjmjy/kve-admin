import Router from "koa-router";
import { clearCache, getCacheInfo } from "@/controllers/cache";
import { hasPerm } from "@/middlewares/permission";
import { PERM_CODES } from "admin-common";

export const cacheRouter = new Router<any, any>({
    prefix: "/cache",
});

const hasPerm_cachemanage = hasPerm(PERM_CODES.system_cachemanage);
const hasPerm_cachemanage_clear = hasPerm(PERM_CODES.system_cachemanage_clear);

cacheRouter.use(hasPerm_cachemanage).get("/info", getCacheInfo).put("/clear", hasPerm_cachemanage_clear, clearCache);
