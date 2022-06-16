import type koa from "koa";
import Router from "koa-router";
import koajwt_ from "koa-jwt";
import { postLogin } from "@/controllers/user";
import { userRouter } from "./user";
import { deptRouter, roleRouter } from "./department";
import { permRouter } from "./permission";
import { demoCollRouter } from "./demo-collection";
import { download } from "./download";

const router = new Router<any, any>({
    prefix: "/api",
});

router.post("/login", postLogin);

router.get("/download/:id", download);

router
    .use("", userRouter.routes(), userRouter.allowedMethods())
    .use("", deptRouter.routes(), deptRouter.allowedMethods())
    .use("", roleRouter.routes(), roleRouter.allowedMethods())
    .use("", permRouter.routes(), permRouter.allowedMethods())
    .use("", demoCollRouter.routes(), demoCollRouter.allowedMethods());

export function setupRouter(app: koa) {
    const koajwt = koajwt_({
        secret: app.context.config.jwtSecret,
        cookie: "Authorization",
        debug: process.env.NODE_ENV === "development",
    }).unless({
        // 以下路由不需要校验 token
        path: ["/api/login"],
    });
    app.use(koajwt);

    app.use(router.routes()).use(router.allowedMethods());
}
