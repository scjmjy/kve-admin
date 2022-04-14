import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import {
    MsgShowType,
    UserProfileResult,
    LoginCredential,
    LoginResult,
    UpdateUserProfile,
    Gender,
    UpdateUserPassword,
    isValidPassword,
    UpdateUserAvatar,
    FindUsersParams,
    FindUsersResult,
} from "admin-common";
import { IUserMethods, UserModel } from "@/model/user";
import { JWT_SECRET } from "@/middlewares/jwt";
import { KoaContext } from "@/types/koa";
import { throwUserNotFoundError } from "./errors";

export async function postLogin(ctx: KoaContext<Undefinable<LoginCredential>, LoginResult>) {
    if (ctx.session && ctx.session.loginErrorCount >= 5) {
        const elapsed = Date.now() - ctx.session.loginErrorTime;
        const rest = 1000 * 30 - elapsed;
        if (rest > 0) {
            ctx.status = StatusCodes.FORBIDDEN;
            ctx.body = {
                code: ctx.status,
                showType: MsgShowType.NOTIFICATION,
                msg: `连续错误多次，请在${rest / 1000}秒钟后重新尝试`,
            };
            return;
        } else {
            ctx.session.loginErrorCount = 0;
            ctx.session.loginErrorTime = 0;
        }
    }
    const credential = ctx.request.body;
    const { username, password } = credential || {};
    if (username && password) {
        const existedUser = await UserModel.findOne({ username }, "password").exec();

        if (!existedUser) {
            throwUserNotFoundError();
        } else {
            const valid = await existedUser.verifyPassword(password);
            if (!valid) {
                ctx.status = StatusCodes.BAD_REQUEST;
                ctx.body = {
                    code: ctx.status,
                    showType: MsgShowType.MESSAGE,
                    msg: "请输入正确的用户名或密码！",
                };
                if (ctx.session) {
                    let count = ctx.session.loginErrorCount || 0;
                    ctx.session.loginErrorCount = ++count;
                    ctx.session.loginErrorTime = Date.now();
                }
            } else {
                const userId = existedUser.id as string;
                const payload: JwtPayload = { id: userId };
                const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
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

/**
 * token 中加密的数据
 */
interface JwtPayload {
    id: string;
}

/**
 * token 解码后，通过 ctx.state.user 获取其内容
 */
interface JwtState {
    user: JwtPayload;
}

export async function getUserProfile(ctx: KoaContext<void, UserProfileResult, JwtState>) {
    // console.log("[Session]: ", ctx.session = null);
    // ctx.session = null;
    const userId = ctx.state.user.id;
    const existedUser = await UserModel.findById<UserProfileResult>(userId)
        .populate({
            path: "depts",
            select: "name",
        })
        .populate({
            path: "roles",
            select: "name",
        })
        .exec();
    if (!existedUser) {
        throwUserNotFoundError();
    } else {
        ctx.status = StatusCodes.OK;
        const { _id, username, realname, email, mobileno, gender, avatar, depts, roles, createdAt, updatedAt } =
            existedUser;
        // console.log("[postLogin]", existedUser);
        ctx.body = {
            code: ctx.status,
            data: {
                _id,
                username,
                realname,
                email,
                mobileno,
                gender,
                avatar,
                depts,
                roles,
                createdAt,
                updatedAt,
            },
        };
    }
}

export async function putUserProfile(ctx: KoaContext<UpdateUserProfile, void, JwtState>) {
    const userId = ctx.state.user.id;
    const existedUser = await UserModel.findById<mongoose.Document & UpdateUserProfile>(
        userId,
        "realname gender mobileno email",
    ).exec();
    if (!existedUser) {
        throwUserNotFoundError();
    } else {
        ctx.status = StatusCodes.OK;
        const { realname, email, mobileno, gender } = ctx.request.body || {};
        realname && (existedUser.realname = realname);
        existedUser.gender = gender || Gender.UNKNOWN;
        existedUser.mobileno = mobileno || "";
        existedUser.email = email || "";
        await existedUser.save();
        ctx.body = {
            code: ctx.status,
        };
    }
}

export async function putUserPassword(ctx: KoaContext<UpdateUserPassword, void, JwtState>) {
    const userId = ctx.state.user.id;
    const { oldPassword, newPassword } = ctx.request.body || {};
    if (!oldPassword || !newPassword) {
        ctx.status = StatusCodes.BAD_REQUEST;
        ctx.body = {
            code: ctx.status,
            showType: MsgShowType.MESSAGE,
            msg: "请提供必要的参数！",
        };
        return;
    } else {
        const valid = isValidPassword(newPassword);
        if (valid === "fail-range") {
            ctx.status = StatusCodes.BAD_REQUEST;
            ctx.body = {
                code: ctx.status,
                showType: MsgShowType.MESSAGE,
                msg: "密码长度错误！请提供 6-24 位字符。",
            };
            return;
        } else if (valid === "fail-strong") {
            ctx.status = StatusCodes.BAD_REQUEST;
            ctx.body = {
                code: ctx.status,
                showType: MsgShowType.MESSAGE,
                msg: "密码强度错误！请提供 2 种以上的字符组合。",
            };
            return;
        }
    }
    const existedUser = await UserModel.findById<mongoose.Document & { password: string } & IUserMethods>(
        userId,
        "password",
    ).exec();
    if (!existedUser) {
        throwUserNotFoundError();
    } else {
        const valid = await existedUser.verifyPassword(oldPassword);
        if (!valid) {
            ctx.status = StatusCodes.BAD_REQUEST;
            ctx.body = {
                code: ctx.status,
                showType: MsgShowType.MESSAGE,
                msg: "当前密码错误！",
            };
        } else {
            existedUser.password = newPassword;
            await existedUser.save();
            ctx.status = StatusCodes.OK;
            ctx.body = {
                code: ctx.status,
            };
        }
    }
}

export async function putUserAvatar(ctx: KoaContext<UpdateUserAvatar, void, JwtState>) {
    const userId = ctx.state.user.id;
    const { avatar } = ctx.request.body || {};
    if (!avatar) {
        ctx.status = StatusCodes.BAD_REQUEST;
        ctx.body = {
            code: ctx.status,
            showType: MsgShowType.MESSAGE,
            msg: "请提供 base64 格式的头像！",
        };
        return;
    }
    const existedUser = await UserModel.findById<mongoose.Document & { avatar: string } & IUserMethods>(
        userId,
        "avatar",
    ).exec();
    if (!existedUser) {
        throwUserNotFoundError();
    } else {
        existedUser.avatar = avatar;
        await existedUser.save();
        ctx.status = StatusCodes.OK;
        ctx.body = {
            code: ctx.status,
        };
    }
}

export async function postFindUsers(ctx: KoaContext<Undefinable<FindUsersParams>, FindUsersResult>) {}
