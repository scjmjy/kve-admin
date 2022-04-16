import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import sharp from "sharp";
import {
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
    CreateUserBody,
    createUserRules,
    UserProfileProjection,
    IUser,
    splitBase64,
    FindUserProjection,
    makeBase64,
} from "admin-common";
import { IUserMethods, UserModel } from "@/model/user";
import { JWT_SECRET } from "@/middlewares/jwt";
import { KoaAjaxContext, KoaContext } from "@/types/koa";
import { throwBadRequestError, throwNotFoundError, throwUserNotFoundError } from "./errors";
import { handlePaginationRequest } from "./utils";
import Schema from "async-validator";

export async function postLogin(ctx: KoaAjaxContext<Undefinable<LoginCredential>, LoginResult>) {
    if (ctx.session && ctx.session.loginErrorCount >= 5) {
        const elapsed = Date.now() - ctx.session.loginErrorTime;
        const rest = 1000 * 30 - elapsed;
        if (rest > 0) {
            ctx.status = StatusCodes.FORBIDDEN;
            ctx.body = {
                code: ctx.status,
                showType: "NOTIFICATION",
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
                if (ctx.session) {
                    let count = ctx.session.loginErrorCount || 0;
                    ctx.session.loginErrorCount = ++count;
                    ctx.session.loginErrorTime = Date.now();
                }
                throwBadRequestError("请输入正确的用户名或密码！");
            } else {
                const userId = existedUser.id as string;
                const payload: JwtPayload = { id: userId };
                const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
                ctx.status = StatusCodes.OK;
                ctx.body = {
                    code: ctx.status,
                    showType: "MESSAGE",
                    msg: "登录成功",
                    data: {
                        token,
                        id: userId,
                    },
                };
            }
        }
    } else {
        throwBadRequestError("请输入完整的用户名或密码！");
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

export async function getUserProfile(ctx: KoaAjaxContext<void, UserProfileResult, JwtState>) {
    const userId = ctx.state.user.id;
    const existedUser = await UserModel.findById<UserProfileResult>(userId, UserProfileProjection.join(" "))
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
        const { _id, username, realname, email, mobileno, gender, depts, roles, createdAt, updatedAt } = existedUser;
        ctx.body = {
            code: ctx.status,
            data: {
                _id,
                username,
                realname,
                email,
                mobileno,
                gender,
                depts,
                roles,
                createdAt,
                updatedAt,
            },
        };
    }
}

export async function putUserProfile(ctx: KoaAjaxContext<UpdateUserProfile, void, JwtState>) {
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

export async function putUserPassword(ctx: KoaAjaxContext<UpdateUserPassword, void, JwtState>) {
    const userId = ctx.state.user.id;
    const { oldPassword, newPassword } = ctx.request.body || {};
    if (!oldPassword || !newPassword) {
        return throwBadRequestError("请提供必要的参数！");
    } else {
        const valid = isValidPassword(newPassword);
        if (valid === "fail-range") {
            throwBadRequestError("密码长度错误！请提供 6-24 位字符。");
        } else if (valid === "fail-strong") {
            throwBadRequestError("密码强度错误！请提供 2 种以上的字符组合。");
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
                showType: "MESSAGE",
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

export async function getUserAvatar(ctx: KoaContext<void, any, void, { userId: string }>) {
    const userId = ctx.params.userId;
    const existedUser = await UserModel.findById<Pick<IUser, "avatar">>(userId, "avatar").exec();
    if (!existedUser) {
        throwUserNotFoundError();
    } else {
        const { avatar } = existedUser;
        const base64 = splitBase64(avatar);
        if (base64) {
            const img = Buffer.from(base64.data, "base64");
            ctx.status = StatusCodes.OK;
            ctx.set({
                "Content-Type": base64.type,
                "Content-Length": img.length.toString(),
                "Cache-Control": `max-age=${60 * 60 * 24}`, // 缓存一天
            });
            ctx.body = img;
        } else {
            throwNotFoundError("此用户没有设置头像", "SILENT");
        }
    }
}

export async function putUserAvatar(ctx: KoaAjaxContext<UpdateUserAvatar, void, JwtState>) {
    const userId = ctx.state.user.id;
    const { avatar = "" } = ctx.request.body || {};
    const base64 = splitBase64(avatar || "");
    if (!base64) {
        return throwBadRequestError("请提供 base64 格式的头像！");
    }
    const existedUser = await UserModel.findById<
        mongoose.Document & Pick<IUser, "avatar" | "thumbnail"> & IUserMethods
    >(userId, "_id").exec();

    if (!existedUser) {
        throwUserNotFoundError();
    } else {
        const imgBuffer = Buffer.from(base64.data, "base64");
        const thumbnail = (await sharp(imgBuffer).resize(50, 50).toBuffer()).toString("base64");
        existedUser.avatar = avatar;
        existedUser.thumbnail = makeBase64(base64.type, thumbnail);
        await existedUser.save();
        ctx.status = StatusCodes.OK;
        ctx.body = {
            code: ctx.status,
        };
    }
}

export async function postFindUsers(ctx: KoaAjaxContext<Undefinable<FindUsersParams>, FindUsersResult>) {
    const res = await handlePaginationRequest(UserModel, ctx.request.body, FindUserProjection.join(" "), {
        doPopulate: true,
    });
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        data: res,
    };
}

export async function postCreateUser(ctx: KoaAjaxContext<Undefinable<CreateUserBody>, CreateResult>) {
    const schema = new Schema(createUserRules);
    const validBody = (await schema.validate(ctx.request.body || {}, { first: true })) as CreateUserBody;
    const newUser = await UserModel.create(validBody);
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: "用户创建成功！",
        data: {
            _id: newUser._id,
        },
    };
}
