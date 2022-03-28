import type { IMiddleware } from "koa-router";
import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { MsgShowType } from "admin-common";
import { KoaContext } from "@/types/koa";

export const errorMiddleware: IMiddleware = async (ctx: KoaContext<any, void>, next) => {
    await next().catch((err: any) => {
        // console.error("[errorMiddleware]", err.originalError);
        if (err.originalError) {
            if (err.originalError instanceof TokenExpiredError) {
                ctx.status = StatusCodes.UNAUTHORIZED;
                ctx.body = {
                    code: "ERR_TOKEN_EXPIRED",
                    showType: MsgShowType.FATAL,
                    msg: "登录已过期，请重新登录！",
                };
            } else if (err.originalError instanceof NotBeforeError || err instanceof JsonWebTokenError) {
                ctx.status = StatusCodes.UNAUTHORIZED;
                ctx.body = {
                    code: ctx.status,
                    showType: MsgShowType.FATAL,
                    msg: "Token 校验出错！",
                };
            }
        } else if (err.status === StatusCodes.UNAUTHORIZED) {
            ctx.status = err.status;
            ctx.body = {
                code: ctx.status,
                showType: MsgShowType.NOTIFICATION,
                msg: "未授权的操作",
            };
        } else {
            console.log("[服务器发生未知错误]", err);

            ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
            ctx.body = {
                code: ctx.status,
                showType: MsgShowType.NOTIFICATION,
                msg: "服务器发生未知错误",
            };
        }
    });
};
