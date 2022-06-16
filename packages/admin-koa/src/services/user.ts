import mongoose from "mongoose";
import { Cache } from "cache-manager";
import { cache } from "@/cache";
import { UserModel } from "@/model/user";
import { IUser, UserProfileProjection } from "admin-common";

// export const UserCacheKey = {
//     perm_nodes_enabled: Symbol("perm_nodes_enabled"),
//     perm_nodes_disabled: Symbol("perm_nodes_disabled"),
//     perm_nodes_deleted: Symbol("perm_nodes_deleted"),
//     perm_nodes_all: Symbol("perm_nodes_all"),
// };

interface FindUserProfileResult extends Omit<IUser, "depts" | "roles"> {
    depts: { _id: string; name: string; status: EnableStatus }[];
    roles: { _id: string; name: string; status: EnableStatus; perms: mongoose.Types.ObjectId[] }[];
}

const UserCacheKeyDynamic = new Set<string>();

export class UserService {
    private constructor() {}

    /**
     * 获取填充后的 User Document
     * @param userId
     */
    static getUserForProfile(userId: string) {
        let key = "user_forProfile_" + userId;

        return cache.wrap(key, async function () {
            const existingUser = await UserModel.findById<FindUserProfileResult>(
                userId,
                UserProfileProjection.join(" "),
            )
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
            UserCacheKeyDynamic.add(key);
            return existingUser;
        });
    }

    static deleteCache() {
        const keys = UserCacheKeyDynamic.keys();
        const p: Promise<any>[] = [];
        UserCacheKeyDynamic.forEach((key) => {
            p.push(cache.del(key));
        });
        UserCacheKeyDynamic.clear();
        return Promise.all(p);
    }
}
