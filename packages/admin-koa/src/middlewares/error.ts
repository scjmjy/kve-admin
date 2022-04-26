import { MongoError, MongoServerError } from "mongodb";
import mongoose from "mongoose";
import type { IMiddleware } from "koa-router";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import type { AsyncValidationError } from "async-validator/dist-types/util";
import { KoaAjaxContext } from "@/types/koa";
import { AjaxError } from "@/controllers/errors";

function isAsyncValidationError(err: any): err is AsyncValidationError {
    return err.errors && err.fields;
}

export const errorMiddleware: IMiddleware = async (ctx: KoaAjaxContext<any, void>, next) => {
    await next().catch((err: any) => {
        if (err.originalError) {
            if (err.originalError instanceof jwt.TokenExpiredError) {
                ctx.status = StatusCodes.UNAUTHORIZED;
                ctx.body = {
                    code: "ERR_TOKEN_EXPIRED",
                    showType: "FATAL",
                    msg: "登录已过期，请重新登录！",
                };
            } else if (err.originalError instanceof jwt.NotBeforeError || err instanceof jwt.JsonWebTokenError) {
                ctx.status = StatusCodes.UNAUTHORIZED;
                ctx.body = {
                    code: ctx.status,
                    showType: "FATAL",
                    msg: "Token 校验出错！",
                };
            }
        } else if (err.status === StatusCodes.UNAUTHORIZED) {
            ctx.status = err.status;
            ctx.body = {
                code: ctx.status,
                showType: "NOTIFICATION",
                msg: "未授权的操作",
            };
        } else if (err instanceof AjaxError) {
            ctx.status = err.status;
            ctx.body = {
                code: err.code,
                showType: err.showType,
                msg: err.message,
            };
        } else if (isAsyncValidationError(err)) {
            ctx.status = StatusCodes.BAD_REQUEST;
            ctx.body = {
                code: ctx.status,
                showType: "MESSAGE",
                msg: err.errors.map((e) => e.message).join("\n"),
            };
        } else if (err instanceof MongoServerError) {
            if (err.code === 11000) {
                // 11000: E11000 duplicate key error
                const keyValue = typeof err.keyValue === "object" ? Object.values(err.keyValue).join(", ") + "：" : "";
                ctx.status = StatusCodes.BAD_REQUEST;
                ctx.body = {
                    code: ctx.status,
                    showType: "NOTIFICATION",
                    msg: `${keyValue}资源已存在，不要重复创建`,
                };
                console.log("[数据库资源已存在]", err);
            } else {
                ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
                ctx.body = {
                    code: ctx.status,
                    showType: "NOTIFICATION",
                    msg: "数据库操作错误，请联系管理员！",
                };
                console.log("[数据库操作错误]", err);
            }
        } else if (err instanceof mongoose.Error.ValidationError) {
            ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
            ctx.body = {
                code: ctx.status,
                showType: "NOTIFICATION",
                msg: "数据库校验错误，请联系管理员！",
            };
            console.log("[数据库校验错误]", err);
        } else if (err instanceof mongoose.Error.CastError) {
            ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
            ctx.body = {
                code: ctx.status,
                showType: "NOTIFICATION",
                msg: "数据库类型转换错误，请联系管理员！",
            };
        } else {
            console.log("[服务器发生未知错误]", err);

            ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
            ctx.body = {
                code: ctx.status,
                showType: "NOTIFICATION",
                msg: "服务器发生未知错误",
            };
        }
    });
};

export function error404(ctx: KoaAjaxContext<any, void>) {
    ctx.status = StatusCodes.NOT_FOUND;
    ctx.body = {
        code: ctx.status,
        showType: "NOTIFICATION",
        msg: "请求的资源不存在: " + ctx.url,
    };
}
