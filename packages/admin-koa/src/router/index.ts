import type koa from "koa";
import Router from "koa-router";
import { postLogin, getUserProfile, putUserProfile, putUserPassword, putUserAvatar } from "@/controllers/user";
import { getHelloworld } from "@/controllers/helloworld";
import { ObjectId } from "bson";
import { koajwt } from "@/middlewares/jwt";
import { getGridFsBucket, upload } from "@/middlewares/upload";
import { getDeptTreeNodes } from "@/controllers/department";

export const router = new Router();

router.post("/api/login", postLogin);
router.get("/api/user/profile", koajwt, getUserProfile);
router.put("/api/user/profile", koajwt, putUserProfile);
router.put("/api/user/password", koajwt, putUserPassword);
router.put("/api/user/avatar", koajwt, putUserAvatar);
router.get("/api/helloworld", getHelloworld);

router.get("/api/dept/tree", koajwt, getDeptTreeNodes);

router.post("/api/upload", upload.single("avatar"), function (ctx) {
    // console.log("[avatar]", ctx.request.file);
    ctx.status = 200;
    ctx.body = {
        code: 200,
        data: ctx.request.file,
    };
});

router.get("/api/download/:id", async function (ctx) {
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
        ctx.set({
            "Content-Type": file.contentType || "",
            "Content-Length": file.length.toString(),
            "Cache-Control": `max-age=${60 * 60 * 24}`, // 缓存一天
        });
        ctx.status = 200;
        ctx.body = bucket.openDownloadStream(new ObjectId(id));
    }
});

export function setupRouter(app: koa) {
    app.use(router.routes()).use(router.allowedMethods());
}
