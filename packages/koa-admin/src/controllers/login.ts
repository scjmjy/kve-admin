import jwt from "koa-jwt";
import { sign } from "jsonwebtoken";
import { KoaContext } from "@/types/koa";
import { MsgShowType } from "@common/AjaxResult";
import { Undefinable } from "@common/utils";
import { LoginCredential, LoginResult } from "@common/login";
import { StatusCodes } from "http-status-codes";
const jwtSecret = "123456";

const userMap: Record<string, string> = {
    superadmin: "1234567",
    admin: "1234567",
    dev01: "1234567",
    dev02: "1234567",
};

export function postLogin(ctx: KoaContext<Undefinable<LoginCredential>, LoginResult>) {
    const credential = ctx.request.body;
    const { userName, password } = credential || {};
    console.log("[postLogin]", ctx.request.headers);
    
    if (userName && password) {
        const userPasswd = userMap[userName];
        if (!userPasswd) {
            ctx.status = StatusCodes.NOT_FOUND;
            ctx.body = {
                code: ctx.status,
                showType: MsgShowType.MESSAGE,
                msg: "用户不存在",
            };
        } else if (password !== userPasswd) {
            ctx.status = StatusCodes.BAD_REQUEST;
            ctx.body = {
                code: ctx.status,
                showType: MsgShowType.MESSAGE,
                msg: "请输入正确的用户名或密码！",
            };
        } else {
            const token = sign({ userName: userName }, jwtSecret, { expiresIn: "7d" });
            ctx.status = StatusCodes.OK;
            ctx.body = {
                code: ctx.status,
                showType: MsgShowType.MESSAGE,
                msg: "登录成功",
                data: {
                    token,
                },
            };
        }
    } else {
        ctx.status = StatusCodes.BAD_REQUEST;
        ctx.body = {
            code: ctx.status,
            showType: MsgShowType.MESSAGE,
            msg: "请输入完整的用户名或密码！",
        };
    }
}

// router.post("/api/login", async (ctx, next) => {
//     const credential = ctx.request.body as Undefinable<LoginCredential>;
//     if (credential && credential.userName && credential.password) {
//     } else {
//         ctx.body;
//     }
// });

// router.get("/api/helloworld", function (ctx, next) {
//     ctx.type = "json";
//     ctx.body = {
//         text: "Hello World",
//     };
// });
