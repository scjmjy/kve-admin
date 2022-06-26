import Redis from "ioredis";
import { DEPARTMENT_CONTAINER_ID, DeptTreeNodesResult } from "admin-common";
import { DepartmentModel } from "@/model/department";

export class DeptService {
    private static DEPT_NODE_PREFIX = "dept_nodes:";

    constructor(private redisClient: Redis) {}

    /**
     * 获取填充后的部门根节点
     */
    async getDeptNodes(): Promise<DeptTreeNodesResult> {
        const key = DeptService.DEPT_NODE_PREFIX + "all";
        const cahced = await this.redisClient.get(key);
        if (cahced) {
            return JSON.parse(cahced);
        }
        const query = DepartmentModel.findById(DEPARTMENT_CONTAINER_ID, null, {
            doPopulate: true,
        }).where("status", /.*/);
        const result = await query.exec();
        const resultJSON = result!.toJSON();
        this.redisClient.set(key, JSON.stringify(resultJSON));
        return resultJSON;
    }

    async deleteCache() {
        const keys = await this.redisClient.keys(DeptService.DEPT_NODE_PREFIX + "*");
        if (keys.length) {
            return this.redisClient.del(keys);
        }
        return Promise.resolve(0);
    }
}
