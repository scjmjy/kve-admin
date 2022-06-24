import type koa from "koa";
import { hasPerm as hasPerm_, PermMatchMode, PERM_CODES } from "admin-common";
import { userService } from "@/services";
import { throwPermissionError } from "@/controllers/errors";

export function hasPerm(perm: string | string[], mode: PermMatchMode = "every"): koa.Middleware {
    return async function (ctx, next) {
        if (!ctx.state || !ctx.state.user || !ctx.state.user.userId) {
            return throwPermissionError("未登录！", "NOTIFICATION");
        }
        if (!ctx.perms) {
            ctx.perms = await userService.getUserPerms(ctx.state.user.userId);
        }
        if (ctx.perms.includes(PERM_CODES.root) || hasPerm_(ctx.perms, perm, mode)) {
            return next();
        }
        return throwPermissionError("无权进行此操作！", "NOTIFICATION");
    };
}
