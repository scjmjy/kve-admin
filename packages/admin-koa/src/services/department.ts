import { Cache } from "cache-manager";
import Redis from "ioredis";
import { DEPARTMENT_CONTAINER_ID, DeptTreeNodesResult } from "admin-common";
import { DepartmentModel } from "@/model/department";

export class DeptService {
    private static DEPT_NODE_PREFIX = "dept_nodes:";
    private redisClient: Redis.Redis | Redis.Cluster;
    constructor(private cache: Cache) {
        this.redisClient = this.cache.store.getClient();
    }

    /**
     * 获取填充后的部门根节点
     */
    getDeptNodes() {
        return this.cache.wrap(DeptService.DEPT_NODE_PREFIX + "all", async function () {
            const query = DepartmentModel.findById<DeptTreeNodesResult>(DEPARTMENT_CONTAINER_ID, null, {
                doPopulate: true,
            }).where("status", /.*/);
            return query.exec();
        });
    }

    async deleteCache() {
        const keys = await this.redisClient.keys(DeptService.DEPT_NODE_PREFIX + "*");
        return this.redisClient.del(keys);
    }
}
