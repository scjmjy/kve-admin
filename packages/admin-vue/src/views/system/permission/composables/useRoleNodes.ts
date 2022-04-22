import { DeptTreeNodesResult } from "admin-common";
import { computed } from "vue";

type RoleType = DeptTreeNodesResult["roles"][0];
interface DeptNode extends Pick<RoleType, "_id" | "name"> {
    roles: RoleNode[];
}

export type RoleNode = RoleType | DeptNode;

export function isDept(node: RoleNode): node is DeptNode {
    if ("roles" in node) {
        return true;
    }
    return false;
}

/**
 * 把 dept 中所有的 roles 提取出来，包含 dept.depts 子部门
 * @param dept 要提取 roles 的 dept
 * @param filters dept._id 数组，不包含在此数组里的 dept 会被忽略
 * @param skipFilter 不进行过滤，因为父 dept 已经通过，所以子 dept 全都通过
 * @returns
 */
export function makeDeepRoleNode(
    dept: DeptTreeNodesResult,
    filters?: string[],
    skipFilter = false,
): RoleNode | undefined {
    let exclude = false;
    if (!skipFilter && filters && !filters.includes(dept._id)) {
        exclude = true;
    }
    const deptNode = {
        _id: dept._id,
        name: dept.name,
        roles: exclude ? [] : (Array.from(dept.roles) as RoleNode[]),
    };
    if (dept.depts.length) {
        for (const d of dept.depts) {
            // exclude=false 说明 dept 没有被 filter 掉
            // 所以它的子 depts 也全通过，跳过 filters 过滤
            const node = makeDeepRoleNode(d, filters, !exclude);
            if (node) {
                deptNode.roles.push(node);
            }
        }
    }
    if (deptNode.roles.length !== 0) {
        return deptNode;
    }
}
