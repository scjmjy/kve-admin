import Redis from "ioredis";
import { EnableStatus, IPermission, isValidStatus, PERMISSION_CONTAINER_ID } from "admin-common";
import { PermissionModel } from "@/model/permission";

export class PermService {
    private static PERM_NODE_PREFIX = "perm_nodes:";
    constructor(private redisClient: Redis) {}

    /**
     * 获取填充后的权限根节点
     * @param status
     */
    async getPermNodes(status?: EnableStatus): Promise<IPermission | undefined> {
        let key = "";

        if (isValidStatus(status as string)) {
            key = PermService.PERM_NODE_PREFIX + status;
        } else {
            key = PermService.PERM_NODE_PREFIX + "all";
        }

        const cached = await this.redisClient.get(key);
        if (cached) {
            return JSON.parse(cached);
        }

        const query = PermissionModel.findById(PERMISSION_CONTAINER_ID, null, {
            doPopulate: true,
        });
        if (isValidStatus(status as string)) {
            query.where("status", status);
        } else {
            query.where("status", /.*/);
        }
        const result = await query.exec();

        this.redisClient.set(key, JSON.stringify(result));
        return result!.toJSON<IPermission>();
    }

    async deleteCache(status?: EnableStatus) {
        let keys: string[] = [];
        if (isValidStatus(status as string)) {
            keys.push(PermService.PERM_NODE_PREFIX + status);
        } else {
            keys = await this.redisClient.keys(PermService.PERM_NODE_PREFIX + "*");
        }
        // console.log("[PermService deleteCache]", keys);
        if (keys.length) {
            return this.redisClient.del(keys);
        }
        return Promise.resolve(0);
    }
}
