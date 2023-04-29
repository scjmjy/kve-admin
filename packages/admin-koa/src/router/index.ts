import type koa from "koa";
import Router from "@koa/router";
import koajwt_ from "koa-jwt";
import bodyParser from "koa-bodyparser";
import { userRouter } from "./user";
import { deptRouter, roleRouter } from "./department";
import { permRouter } from "./permission";
import { demoCollRouter } from "./demo-collection";
import { demoPermRouter } from "./demo-permission";
import { monitorRouter } from "./monitor";
import { download } from "./download";
import { getCaptcha } from "@/controllers/user";

const router = new Router<any, any>({
    prefix: "/api",
});

export const RouteConsts = {
    login: "/api/user/login",
    logout: "/api/user/logout",
    captcha: "/api/captcha",
};

router.get("/captcha", getCaptcha).get("/download/:id", download);

router
    .use("", userRouter.routes(), userRouter.allowedMethods())
    .use("", deptRouter.routes(), deptRouter.allowedMethods())
    .use("", roleRouter.routes(), roleRouter.allowedMethods())
    .use("", permRouter.routes(), permRouter.allowedMethods())
    .use("", monitorRouter.routes(), monitorRouter.allowedMethods())
    .use("", demoCollRouter.routes(), demoCollRouter.allowedMethods())
    .use("", demoPermRouter.routes(), demoPermRouter.allowedMethods());

export function setupRouter(app: koa) {
    const { jwtSecret, isDev } = app.context.config;
    const koajwt = koajwt_({
        secret: jwtSecret,
        cookie: "Authorization",
        debug: isDev,
    }).unless({
        // 以下路由不需要校验 token
        path: [RouteConsts.login, RouteConsts.captcha],
    });

    app.use(koajwt);
    app.use(bodyParser()).use(router.routes()).use(router.allowedMethods());
}
