import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { MsgShowType, Undefinable, UserProfileResult, LoginCredential, LoginResult } from "admin-common";
import { UserModel } from "@/model/user";
import { JWT_SECRET } from "@/middlewares/jwt";
import { KoaContext } from "@/types/koa";

export async function postLogin(ctx: KoaContext<Undefinable<LoginCredential>, LoginResult>) {
    const credential = ctx.request.body;
    const { username, password } = credential || {};
    if (username && password) {
        const existedUser = await UserModel.findOne({ username }, "password").exec();

        if (!existedUser) {
            ctx.status = StatusCodes.NOT_FOUND;
            ctx.body = {
                code: ctx.status,
                showType: MsgShowType.MESSAGE,
                msg: "用户不存在",
            };
        } else {
            const valid = await existedUser.verifyPassword(password);
            if (!valid) {
                ctx.status = StatusCodes.BAD_REQUEST;
                ctx.body = {
                    code: ctx.status,
                    showType: MsgShowType.MESSAGE,
                    msg: "请输入正确的用户名或密码！",
                };
            } else {
                const userId = existedUser.id as string;
                const payload: JwtPayload = { id: userId };
                const token = jwt.sign(payload, JWT_SECRET, { expiresIn: 60 });
                ctx.status = StatusCodes.OK;
                ctx.body = {
                    code: ctx.status,
                    showType: MsgShowType.MESSAGE,
                    msg: "登录成功",
                    data: {
                        token,
                        id: userId,
                    },
                };
            }
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

// type GetUserProfileParams = {
//     id?: string;
// };

interface JwtPayload {
    id: string;
}

interface GetUserProfileState {
    user: JwtPayload;
}

export async function getUserProfile(ctx: KoaContext<void, UserProfileResult, GetUserProfileState>) {
    const userId = ctx.state.user.id;
    if (userId) {
        const existedUser = await UserModel.findById(userId).exec();
        if (!existedUser) {
            ctx.status = StatusCodes.NOT_FOUND;
            ctx.body = {
                code: ctx.status,
                showType: MsgShowType.MESSAGE,
                msg: "用户不存在",
            };
        } else {
            ctx.status = StatusCodes.OK;
            const { id, username, realname, gender, avatar } = existedUser;
            // console.log("[postLogin]", existedUser);
            ctx.body = {
                code: ctx.status,
                data: {
                    id,
                    username,
                    realname,
                    gender,
                    avatar,
                },
            };
        }
    } else {
        ctx.status = StatusCodes.BAD_REQUEST;
        ctx.body = {
            code: ctx.status,
            showType: MsgShowType.MESSAGE,
            msg: "请提供用户 ID",
        };
    }
}
