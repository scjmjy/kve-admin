import { LogData } from "admin-common";
import { RouteConsts } from "@/router";
import { getIpLocation } from "@/utils/ip";

export const responseTime: RestAjaxMiddleware = async (ctx, next) => {
    const startTime = Date.now();
    return next().finally(async function () {
        const endTime = Date.now();
        let { userId, username, ip, location } = ctx.session || {};
        const url = ctx._matchedRoute instanceof RegExp ? ctx._matchedRoute.toString() : ctx._matchedRoute || ctx.url;
        if (ip !== ctx.ip || !location) {
            location = await getIpLocation(ctx, ctx.ip);
        }
        const logInfo: LogData = {
            method: ctx.method,
            url,
            query: ctx.query,
            params: ctx.params,
            reqBody: ctx.request.body || {},
            status: ctx.status,
            success: ctx.status < 400,
            userId: userId,
            username: username,
            ip: ctx.ip,
            location,
            elapsedTime: endTime - startTime,
        };
        if (ctx.path === RouteConsts.login) {
            delete logInfo.reqBody.password;
            ctx.logger.access.info(logInfo);
        } else {
            ctx.logger.operation.info(logInfo);
        }
    });
};
