import { Cache } from "cache-manager";
import { cache } from "@/cache";
import { DepartmentModel } from "@/model/department";
import { DEPARTMENT_CONTAINER_ID, DeptTreeNodesResult } from "admin-common";

const DeptCacheKey = {
    dept_nodes_all: Symbol("dept_nodes_all"),
};

export class DeptService {
    private constructor() {}

    /**
     * 获取填充后的部门根节点
     */
    static getDeptNodes() {
        return cache.wrap(DeptCacheKey.dept_nodes_all.toString(), async function () {
            const query = DepartmentModel.findById<DeptTreeNodesResult>(DEPARTMENT_CONTAINER_ID, null, {
                doPopulate: true,
            }).where("status", /.*/);
            return query.exec();
        });
    }

    static deleteCache() {
        const keys = Object.keys(DeptCacheKey);
        return Promise.all(keys.map((key) => cache.del(key)));
    }
}
