import mongoose from "mongoose";
import {
    IPermission,
    IUser,
    PERM_CODES,
    ROLE_SUPERADMIN_ID,
    UserProfileProjection,
    UserProfileResult,
} from "admin-common";
import type Redis from "ioredis";
import { UserModel } from "@/model/user";
import { DepartmentModel } from "@/model/department";
import { permService } from "./index";
// import "@/utils/cache"; // TODO for ts-node-dev
import { SessionMaxAge } from "@/middlewares/session";

// export const UserCacheKey = {
//     perm_nodes_enabled: Symbol("perm_nodes_enabled"),
//     perm_nodes_disabled: Symbol("perm_nodes_disabled"),
//     perm_nodes_deleted: Symbol("perm_nodes_deleted"),
//     perm_nodes_all: Symbol("perm_nodes_all"),
// };

interface DeptType {
    _id: mongoose.Types.ObjectId;
    name: string;
}
interface RoleType {
    _id: mongoose.Types.ObjectId;
    name: string;
    perms: mongoose.Types.ObjectId[];
}
interface FindUserProfileResult extends Omit<IUser, "depts" | "roles"> {
    // depts: (mongoose.Document & { _id: mongoose.Types.ObjectId; name: string })[];
    // roles: (mongoose.Document & { _id: mongoose.Types.ObjectId; name: string; perms: mongoose.Types.ObjectId[] })[];
    depts: (mongoose.Document<mongoose.Types.ObjectId, void, DeptType> & DeptType)[];
    roles: (mongoose.Document<mongoose.Types.ObjectId, void, RoleType> & RoleType)[];
}

/**
 *
 * @param perms 被过滤的权限数组
 * @param permIds 不在此数组里的权限会被过滤掉
 * @param permCodes 过滤之后的权限的 codes，扁平的
 * @returns
 */
function filterPerms(perms: IPermission[], permIds: string[], permCodes: string[]): IPermission[] {
    const result: IPermission[] = [];
    for (const perm of perms) {
        const id = (perm._id as unknown as mongoose.Types.ObjectId).toString();
        const includes = permIds.includes(id);
        if (perm.type === "menugroup") {
            includes && permCodes.push(perm.code);
            const children = filterPerms(perm.children || [], permIds, permCodes);
            if (includes || children.length) {
                result.push({
                    ...perm,
                    children,
                });
            }
        } else if (includes) {
            result.push(perm);
            permCodes.push(perm.code);
        }
    }
    return result;
}
export class UserService {
    static USER_PROFILE_KEY = "user_profile:";
    static USER_PERMS_KEY = "user_perms:";
    constructor(private redisClient: Redis) {}

    private async setUserPerms(userId: string, perms: string[]) {
        return this.redisClient.set(UserService.USER_PERMS_KEY + userId, JSON.stringify(perms), "PX", SessionMaxAge.ms);
    }

    async getUserPerms(userId: string): Promise<string[]> {
        let perms = await this.redisClient.get(UserService.USER_PERMS_KEY + userId);
        if (!perms) {
            const profile = await this.getUserProfile(userId);
            return profile ? profile.permCodes : [];
        }
        return JSON.parse(perms);
    }

    async getUserProfile(userId: string): Promise<UserProfileResult | undefined> {
        const key = UserService.USER_PROFILE_KEY + userId;
        let cached = await this.redisClient.get(key);
        if (cached) {
            return JSON.parse(cached);
        }
        let existingUser = await UserModel.findById<FindUserProfileResult>(userId, UserProfileProjection.join(" "))
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
            return undefined;
        }
        let { _id, username, realname, email, mobileno, gender, depts, roles, createdAt, updatedAt } = existingUser;

        // 去除无效的 dept 里的 roles
        const allRoleIds = roles.map((role) => role._id);
        const inactiveDepts = await DepartmentModel.find<{ roles: mongoose.Types.ObjectId[] }>(
            {
                roles: {
                    $in: allRoleIds as any,
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

        let userPerms: IPermission[] = [];
        let permCodes: string[] = [];

        const perm = await permService.getPermNodes("enabled");
        const isSuperadmin = roles.find((role) => {
            const id = role._id.toString();
            return id === ROLE_SUPERADMIN_ID;
        });

        if (perm && isSuperadmin) {
            // 超级管理员拥有所有权限
            userPerms = perm.children || [];
            permCodes = [PERM_CODES.root];
        } else if (perm) {
            const permIds: string[] = [];
            roles.forEach((item) => {
                item.perms.forEach((perm) => permIds.push(perm.toString()));
            });
            userPerms = filterPerms(perm.children || [], permIds, permCodes);
        }

        this.setUserPerms(userId, permCodes);

        const deptsJSON = depts.map((dept) => {
            return {
                _id: dept._id.toString(),
                name: dept.name,
            };
        });
        const rolesJSON = roles.map((role) => {
            return {
                _id: role._id.toString(),
                name: role.name,
            };
        });

        const userProfile = {
            _id,
            username,
            realname,
            email,
            mobileno,
            gender,
            depts: deptsJSON,
            roles: rolesJSON,
            createdAt,
            updatedAt,
            perms: userPerms,
            permCodes,
        };
        this.redisClient.set(key, JSON.stringify(userProfile), "PX", SessionMaxAge.ms);
        return userProfile;
    }

    async deleteCache(userId?: string) {
        let keys: string[] = [];
        if (userId) {
            keys.push(UserService.USER_PROFILE_KEY + userId);
            keys.push(UserService.USER_PERMS_KEY + userId);
        } else {
            const keys1 = await this.redisClient.keys(UserService.USER_PROFILE_KEY + "*");
            const keys2 = await this.redisClient.keys(UserService.USER_PERMS_KEY + "*");
            keys = keys1.concat(keys2);
        }
        if (keys.length) {
            return this.redisClient.del(keys);
        }
        return Promise.resolve(0);
    }
}
