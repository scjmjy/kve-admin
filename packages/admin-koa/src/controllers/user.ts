import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import sharp from "sharp";
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
    UserProfileProjection,
    IUser,
    splitBase64,
    FindUserProjection,
    makeBase64,
    UpdateUserBody,
    UserIdsBody,
    isValidStatus,
    IPermission,
    PERMISSION_CONTAINER_ID,
    ROLE_SUPERADMIN_ID,
} from "admin-common";
import { IUserMethods, UserModel } from "@/model/user";
import { JwtPayload, KoaAjaxContext, KoaContext } from "@/types/koa";
import { throwBadRequestError, throwNotFoundError, throwUserNotFoundError } from "./errors";
import { handlePaginationRequest } from "./utils";
import Schema from "async-validator";
import { PermissionModel } from "@/model/permission";
import { DepartmentModel } from "@/model/department";

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
                const payload: JwtPayload = { id: userId };
                const token = jwt.sign(payload, ctx.config.jwtSecret, { expiresIn: "7d" });
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

function filterPerms(perms: IPermission[], permIds: string[]): IPermission[] {
    const filtered: IPermission[] = [];
    for (const perm of perms) {
        const id = (perm._id as unknown as mongoose.Types.ObjectId).toString();
        if (perm.type === "menugroup") {
            const children = filterPerms(perm.children || [], permIds);
            if (children.length) {
                filtered.push({
                    ...perm,
                    children,
                });
            }
        } else if (permIds.includes(id)) {
            filtered.push(perm);
        }
    }
    return filtered;
}

export async function getUserProfile(ctx: KoaAjaxContext<void, UserProfileResult, any, { perms: any }>) {
    interface FindUserResult extends Omit<IUser, "depts" | "roles"> {
        depts: { _id: string; name: string; status: EnableStatus }[];
        roles: { _id: string; name: string; status: EnableStatus; perms: mongoose.Types.ObjectId[] }[];
    }
    const userId = ctx.state.user.id;
    const existingUser = await UserModel.findById<FindUserResult>(userId, UserProfileProjection.join(" "))
        .populate({
            path: "depts",
            select: "name",
            match: {
                status: "enabled",
            },
        })
        .populate({
            path: "roles",
            select: "name perms",
            match: {
                status: "enabled",
            },
        })
        .exec();
    if (!existingUser) {
        throwUserNotFoundError(userId);
    } else {
        let { _id, username, realname, email, mobileno, gender, depts, roles, createdAt, updatedAt } = existingUser;

        // 去除无效的 dept 里的 roles
        const allRoleIds = roles.map((role) => role._id);
        const inactiveDepts = await DepartmentModel.find<{ roles: string[] }>(
            {
                roles: {
                    $in: allRoleIds,
                },
                status: {
                    $ne: "enabled",
                },
            },
            "name roles",
        );
        for (const dept of inactiveDepts) {
            roles = roles.filter((role) => dept.roles.includes(role._id));
        }

        let userPerms: Undefinable<IPermission[]>;
        const { perms } = ctx.query;
        if (perms) {
            const query = PermissionModel.findById(PERMISSION_CONTAINER_ID, null, {
                doPopulate: true,
            }).where("status", "enabled");
            const perm = await query.exec();
            const isSuperadmin = roles.find((role) => {
                const id = (role._id as unknown as mongoose.Types.ObjectId).toString();
                return id === ROLE_SUPERADMIN_ID;
            });
            if (perm && isSuperadmin) {
                // 超级管理员拥有所有权限
                userPerms = perm.children || [];
            } else if (perm) {
                const permIds: string[] = [];
                roles.forEach((item) => {
                    permIds.push(...item.perms.map((p) => p.toString()));
                });
                userPerms = filterPerms(perm.toObject().children || [], permIds);
            }
        }
        depts.forEach((dept) => {
            // @ts-ignore
            delete dept.roles;
        });
        ctx.status = StatusCodes.OK;
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
                perms: userPerms,
            },
        };
    }
}

export async function putUserProfile(ctx: KoaAjaxContext<UpdateUserProfile>) {
    const userId = ctx.state.user.id;
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
    const userId = ctx.state.user.id;
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
