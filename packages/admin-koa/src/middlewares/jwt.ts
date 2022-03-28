import type { IMiddleware } from "koa-router";
import koajwt_ from "koa-jwt";

export const JWT_SECRET = "123456";

export const koajwt = koajwt_({
    secret: JWT_SECRET,
    cookie: "Authorization",
    debug: process.env.NODE_ENV === "development"
}) as unknown as IMiddleware;
