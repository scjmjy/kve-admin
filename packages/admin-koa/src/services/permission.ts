import { Cache } from "cache-manager";
import Redis from "ioredis";
import { IPermission, isValidStatus, PERMISSION_CONTAINER_ID } from "admin-common";
import { PermissionModel } from "@/model/permission";

export class PermService {
    private static PERM_NODE_PREFIX = "perm_nodes:";
    private redisClient: Redis.Redis | Redis.Cluster;
    constructor(private cache: Cache) {
        this.redisClient = this.cache.store.getClient();
    }

    /**
     * 获取填充后的权限根节点
     * @param status
     */
    getPermNodes(status: EnableStatus): Promise<IPermission | undefined> {
        let key = "";

        if (isValidStatus(status as string)) {
            key = PermService.PERM_NODE_PREFIX + status;
        } else {
            key = PermService.PERM_NODE_PREFIX + "all";
        }

        return this.cache.wrap(key, async function () {
            const query = PermissionModel.findById(PERMISSION_CONTAINER_ID, null, {
                doPopulate: true,
            });
            if (isValidStatus(status as string)) {
                query.where("status", status);
            } else {
                query.where("status", /.*/);
            }
            const result = await query.exec();
            return result ? result.toObject() : undefined;
        });
    }

    async deleteCache(status?: EnableStatus) {
        let keys: string[] = [];
        if (isValidStatus(status as string)) {
            keys.push(PermService.PERM_NODE_PREFIX + status);
        } else {
            keys = await this.redisClient.keys(PermService.PERM_NODE_PREFIX + "*");
        }
        console.log("[PermService deleteCache]", keys);

        return this.redisClient.del(keys);
    }
}
