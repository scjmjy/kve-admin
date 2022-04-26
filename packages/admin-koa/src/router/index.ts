import type koa from "koa";
import Router from "koa-router";
import {
    postLogin,
    getUserProfile,
    putUserProfile,
    putUserPassword,
    putUserAvatar,
    postFindUsers,
    postUser,
    putUser,
    getUserAvatar,
    deleteUser,
    putEnableUsers,
} from "@/controllers/user";
import { getHelloworld } from "@/controllers/helloworld";
import { ObjectId } from "bson";
import { koajwt } from "@/middlewares/jwt";
import { getGridFsBucket, upload } from "@/middlewares/upload";
import {
    getDeptTreeNodes,
    postRole,
    putRole,
    putEnableRole,
    postReorderDepts,
    postReorderRoles,
    putEnableDept,
    putDept,
    postDept,
} from "@/controllers/department";
import { getPermNodes, postPermission, putPermission } from "@/controllers/permission";

export const router = new Router<any, any>();

router.post("/api/login", postLogin);
router.post("/api/user", koajwt, postUser);
router.put("/api/user", koajwt, putUser);
router.delete("/api/user/:userId", koajwt, deleteUser);
router.put("/api/user/status/:status", koajwt, putEnableUsers);
router.get("/api/user/profile", koajwt, getUserProfile);
router.put("/api/user/profile", koajwt, putUserProfile);
router.put("/api/user/password", koajwt, putUserPassword);
router.put("/api/user/avatar", koajwt, putUserAvatar);
router.get("/api/user/avatar/:userId", getUserAvatar);
router.post("/api/user/list", koajwt, postFindUsers);

router.get("/api/helloworld", getHelloworld);

router.get("/api/dept/tree", koajwt, getDeptTreeNodes);
router.post("/api/dept/reorder", koajwt, postReorderDepts);
router.post("/api/dept", koajwt, postDept);
router.put("/api/dept", koajwt, putDept);
router.put("/api/dept/status/:deptId/:status", koajwt, putEnableDept);

router.post("/api/role", koajwt, postRole);
router.put("/api/role", koajwt, putRole);
router.put("/api/role/status/:roleId/:status", koajwt, putEnableRole);
router.post("/api/role/reorder", koajwt, postReorderRoles);

router.get("/api/perm/tree", koajwt, getPermNodes);
router.post("/api/perm", koajwt, postPermission);
router.put("/api/perm", koajwt, putPermission);

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
