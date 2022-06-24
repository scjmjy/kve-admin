import { ObjectId } from "bson";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import UAParser from "ua-parser-js";
import { StatusCodes } from "http-status-codes";
import sharp from "sharp";
import { pick } from "lodash-unified";
import {
    UserProfileResult,
    LoginCredential,
    LoginResult,
    UpdateUserProfile,
    UpdateUserPassword,
    isValidPassword,
    UpdateUserAvatar,
    FindUsersParams,
    FindUsersResult,
    CreateUserBody,
    getUserRules,
    IUser,
    splitBase64,
    FindUserProjection,
    makeBase64,
    UpdateUserBody,
    UserIdsBody,
    isValidStatus,
    OnlineUsersResult,
} from "admin-common";
import { IUserMethods, UserModel } from "@/model/user";
import { JwtPayload, KoaAjaxContext, KoaContext } from "@/types/koa";
import { throwBadRequestError, throwNotFoundError, throwUserNotFoundError } from "./errors";
import { handlePaginationRequest } from "./utils";
import { Schema } from "@/utils/async-validator";
import { userService } from "@/services";
import { SessionData, SessionMaxAge, SESSION_PREFIX } from "@/middlewares/session";

export async function postLogin(ctx: KoaAjaxContext<Undefinable<LoginCredential>, LoginResult>) {
    if (ctx.session && ctx.session.loginErrorCount! >= 5) {
        const elapsed = Date.now() - ctx.session.loginErrorTime!;
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
            delete ctx.session.loginErrorCount;
            delete ctx.session.loginErrorTime;
        }
    }
    const { username, password } = ctx.request.body || {};
    if (username && password) {
        const existingUser = await UserModel.findOne({ username }, "password").exec();

        if (!existingUser) {
            throwUserNotFoundError(username);
        } else {
            const valid = await existingUser.verifyPassword(password);
            if (!valid) {
                if (ctx.session) {
                    let count = ctx.session.loginErrorCount || 0;
                    ctx.session.loginErrorCount = ++count;
                    ctx.session.loginErrorTime = Date.now();
                }
                throwBadRequestError("请输入正确的用户名或密码！");
            } else {
                const userId = existingUser.id as string;
                const payload: JwtPayload = { userId: userId, uuid: new ObjectId() };
                const token = jwt.sign(payload, ctx.config.jwtSecret, { expiresIn: SessionMaxAge.seconds });

                const uaParser = new UAParser(ctx.headers["user-agent"]);
                const browser = uaParser.getBrowser();
                const os = uaParser.getOS();
                const session: SessionData = {
                    username,
                    userId: payload.userId,
                    ip: ctx.ip,
                    browser: `${browser.name}/${browser.version}`,
                    os: `${os.name}/${os.version}`,
                    loginTime: Date.now(),
                };
                Object.assign(ctx.session!, session);

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

export async function getUserProfile(ctx: KoaAjaxContext<void, UserProfileResult, any, { perms: any }>) {
    const userId = ctx.state.user.userId;
    const userProfile = await userService.getUserProfile(userId);
    if (!userProfile) {
        throwUserNotFoundError(userId);
    } else {
        const { perms } = ctx.query;
        if (!perms) {
            userProfile.perms = [];
        }
        ctx.status = StatusCodes.OK;
        ctx.body = {
            code: ctx.status,
            data: userProfile,
        };
    }
}

export async function putUserProfile(ctx: KoaAjaxContext<UpdateUserProfile>) {
    const userId = ctx.state.user.userId;
    const existingUser = await UserModel.findById<mongoose.Document & UpdateUserProfile>(
        userId,
        "realname gender mobileno email",
    ).exec();
    if (!existingUser) {
        throwUserNotFoundError(userId);
    } else {
        ctx.status = StatusCodes.OK;
        const { realname, email, mobileno, gender } = ctx.request.body || {};
        realname && (existingUser.realname = realname);
        existingUser.gender = gender || "UNKNOWN";
        existingUser.mobileno = mobileno || "";
        existingUser.email = email || "";
        await existingUser.save();
        ctx.body = {
            code: ctx.status,
        };
    }
}

export async function putUserPassword(ctx: KoaAjaxContext<UpdateUserPassword>) {
    const userId = ctx.state.user.userId;
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
    const existingUser = await UserModel.findById<mongoose.Document & { password: string } & IUserMethods>(
        userId,
        "password",
    ).exec();
    if (!existingUser) {
        throwUserNotFoundError(userId);
    } else {
        const valid = await existingUser.verifyPassword(oldPassword);
        if (!valid) {
            ctx.status = StatusCodes.BAD_REQUEST;
            ctx.body = {
                code: ctx.status,
                showType: "MESSAGE",
                msg: "当前密码错误！",
            };
        } else {
            existingUser.password = newPassword;
            await existingUser.save();
            ctx.status = StatusCodes.OK;
            ctx.body = {
                code: ctx.status,
            };
        }
    }
}

export async function getUserAvatar(ctx: KoaContext<void, any, { userId: string }>) {
    const { userId } = ctx.params;
    const existingUser = await UserModel.findById<Pick<IUser, "avatar">>(userId, "avatar").exec();
    if (!existingUser) {
        throwUserNotFoundError(userId);
    } else {
        const { avatar } = existingUser;
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

export async function putUserAvatar(ctx: KoaAjaxContext<UpdateUserAvatar>) {
    const userId = ctx.state.user.userId;
    const { avatar = "" } = ctx.request.body || {};
    const base64 = splitBase64(avatar || "");
    if (!base64) {
        return throwBadRequestError("请提供 base64 格式的头像！");
    }
    const existingUser = await UserModel.findById<
        mongoose.Document & Pick<IUser, "avatar" | "thumbnail"> & IUserMethods
    >(userId, "_id").exec();

    if (!existingUser) {
        throwUserNotFoundError(userId);
    } else {
        const imgBuffer = Buffer.from(base64.data, "base64");
        const thumbnail = (await sharp(imgBuffer).resize(50, 50).toBuffer()).toString("base64");
        existingUser.avatar = avatar;
        existingUser.thumbnail = makeBase64(base64.type, thumbnail);
        await existingUser.save();
        ctx.status = StatusCodes.OK;
        ctx.body = {
            code: ctx.status,
        };
    }
}

export async function postFindUsers(ctx: KoaAjaxContext<Undefinable<FindUsersParams>, FindUsersResult>) {
    const params = ctx.request.body;
    if (!params || !params.pageNum || !params.pageSize) {
        return throwBadRequestError("分页参数错误！");
    }
    const res = await handlePaginationRequest(UserModel, params, FindUserProjection.join(" "), undefined, {
        doPopulate: true,
    });
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        data: res,
    };
}

export async function postUser(ctx: KoaAjaxContext<Undefinable<CreateUserBody>, CreateResult>) {
    const schema = new Schema(getUserRules("create"));
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

export async function putUser(ctx: KoaAjaxContext<Undefinable<UpdateUserBody>, void>) {
    const schema = new Schema(getUserRules("update"));
    const validBody = (await schema.validate(ctx.request.body || {}, { first: true })) as UpdateUserBody;
    if (validBody.password === "") {
        delete validBody.password;
    }
    const res = await UserModel.findByIdAndUpdate(validBody._id, validBody, {
        projection: "_id",
    });
    if (!res) {
        return throwNotFoundError("用户不存在:" + validBody._id);
    }
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: "用户更新成功！",
    };
}

export async function deleteUser(ctx: KoaAjaxContext<void, void, { userId: string }>) {
    const { userId } = ctx.params;
    const existingUser = await UserModel.findById<mongoose.Document & Pick<IUser, "status">>(userId, "status").exec();
    if (!existingUser) {
        return throwUserNotFoundError(userId);
    }
    existingUser.status = "deleted";
    await existingUser.save();
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: "用户删除成功！",
    };
}

export async function putEnableUsers(ctx: KoaAjaxContext<UserIdsBody, void, { status: EnableStatus }>) {
    const { ids } = ctx.request.body || {};
    const { status } = ctx.params;
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !isValidStatus(status)) {
        return throwBadRequestError("请提供有效的用户 ID 或 状态值！");
    }
    const res = await UserModel.bulkWrite([
        {
            updateMany: {
                filter: {
                    _id: {
                        $in: ids,
                    },
                },
                update: { status: status },
            },
        },
    ]);
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: `${status === "enabled" ? "启用" : status === "disabled" ? "禁用" : "删除"}${res.modifiedCount}个用户！`,
    };
}

interface SessionDataWithId extends SessionData {
    sessionId: string;
}

const labelProps: { prop: keyof SessionDataWithId; label: string }[] = [
    {
        prop: "sessionId",
        label: "会话编号",
    },
    {
        prop: "username",
        label: "用户名",
    },
    {
        prop: "ip",
        label: "登录 IP",
    },
    {
        prop: "browser",
        label: "浏览器",
    },
    {
        prop: "os",
        label: "操作系统",
    },
    {
        prop: "loginTime",
        label: "登录时间",
    },
];

export async function getOnlineUsers(ctx: KoaAjaxContext<void, OnlineUsersResult>) {
    const allUserKeys = await ctx.redisClient.keys(SESSION_PREFIX + "*");
    const allUsers = await ctx.redisClient.mget(allUserKeys);
    const allUsersJson: Partial<SessionDataWithId>[] = [];
    allUsers.forEach((val, index) => {
        if (val) {
            const data = pick(
                JSON.parse(val) as SessionData,
                labelProps.map((val) => val.prop),
            );
            allUsersJson.push(
                Object.assign(data, {
                    sessionId: allUserKeys[index].replace(SESSION_PREFIX, ""),
                }),
            );
        }
    });
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        data: {
            columns: labelProps,
            rows: allUsersJson,
        },
    };
}
