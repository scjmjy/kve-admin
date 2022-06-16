import { Cache } from "cache-manager";
import { IPermission, isValidStatus, PERMISSION_CONTAINER_ID } from "admin-common";
import { cache } from "@/cache";
import { PermissionModel } from "@/model/permission";

const PermCacheKey = {
    perm_nodes_enabled: Symbol("perm_nodes_enabled"),
    perm_nodes_disabled: Symbol("perm_nodes_disabled"),
    perm_nodes_deleted: Symbol("perm_nodes_deleted"),
    perm_nodes_all: Symbol("perm_nodes_all"),
};

export class PermService {
    private constructor() {}

    /**
     * 获取填充后的权限根节点
     * @param status
     */
    static getPermNodes(status: EnableStatus) {
        let key = PermCacheKey.perm_nodes_all;

        if (isValidStatus(status as string)) {
            key = PermCacheKey[("perm_nodes_" + status) as keyof typeof PermCacheKey];
        }

        return cache.wrap(key.toString(), async function () {
            const query = PermissionModel.findById(PERMISSION_CONTAINER_ID, null, {
                doPopulate: true,
            });
            if (isValidStatus(status as string)) {
                query.where("status", status);
            } else {
                query.where("status", /.*/);
            }
            return query.exec();
        });
    }

    static deleteCache() {
        const keys = Object.keys(PermCacheKey);
        return Promise.all(keys.map(key => cache.del(key)))
    }
}
