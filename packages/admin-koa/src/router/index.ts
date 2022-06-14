import type koa from "koa";
import Router from "koa-router";
import koajwt_ from "koa-jwt";
import { GridFSBucketReadStream } from "mongodb";
import { ObjectId } from "bson";
import { extname } from "path";
import { AjaxResult } from "admin-common";
import { postLogin } from "@/controllers/user";
import { KoaContext } from "@/types/koa";
import { getGridFsBucket } from "@/middlewares/upload";
import { userRouter } from "./user";
import { deptRouter, roleRouter } from "./department";
import { permRouter } from "./permission";
import { demoCollRouter } from "./demo-collection";

const router = new Router<any, any>({
    prefix: "/api",
});

router.post("/login", postLogin);

router.get(
    "/download/:id",
    async function (ctx: KoaContext<void, AjaxResult | GridFSBucketReadStream, { id: string }>) {
        const id = ctx.params.id;
        if (!id || id.length !== 24) {
            ctx.status = 400;
            ctx.body = {
                code: 400,
                showType: "MESSAGE",
                msg: "文件 ID 格式错误！",
            };
            return;
        }
        const objId = new ObjectId(id);
        const bucket = getGridFsBucket();
        const cursor = bucket.find({
            _id: objId,
        });
        const file = await cursor.next();
        if (!file) {
            ctx.status = 404;
            ctx.body = {
                code: 404,
                showType: "MESSAGE",
                msg: "文件或图片未找到！",
            };
        } else {
            let contentType = file.contentType || "";
            const ext = extname(file.filename);
            if (ext === ".7z") {
                contentType = "application/x-7z-compressed";
            }
            ctx.set({
                "Content-Type": contentType,
                "Content-Length": file.length.toString(),
                "Cache-Control": `max-age=${60 * 60 * 24}`, // 缓存一天
            });
            ctx.status = 200;
            ctx.body = bucket.openDownloadStream(objId);
        }
    },
);

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
