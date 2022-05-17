import { inject, Ref } from "vue";
import { DeptTreeNodesResult, PermNodeResult } from "admin-common";
import { filterPerms } from "./useMenuNodes";

export const symbolFetchDept = Symbol("symbol.dept.fetch");
export const symbolDeptOriginal = Symbol("symbol.dept.original");
export const symbolResetDeptCurrentKey = Symbol("symbol.dept.tree.currentkey");

export function useDeptInject() {
    return {
        deptOriginal: inject<Ref<DeptTreeNodesResult>>(symbolDeptOriginal)!,
        fetchDept: inject<() => Promise<void>>(symbolFetchDept)!,
        resetDeptCurrentKey: inject<(deptId?: string) => void>(symbolResetDeptCurrentKey)!,
    };
}

export function deepFindOriginalDept(dept: DeptTreeNodesResult, deptId: string): DeptTreeNodesResult | undefined {
    if (dept._id === deptId) {
        return dept;
    } else {
        for (const d of dept.depts) {
            const found = deepFindOriginalDept(d, deptId);
            if (found) {
                return found;
            }
        }
    }
}

export function deepFindOriginalRole(
    dept: DeptTreeNodesResult,
    roleId: string,
): DeptTreeNodesResult["roles"][0] | undefined {
    const found = dept.roles.find((item) => item._id === roleId);
    if (found) {
        return found;
    }
    for (const d of dept.depts) {
        const found = deepFindOriginalRole(d, roleId);
        if (found) {
            return found;
        }
    }
}

export function updateOriginalDept(deptOriginal: DeptTreeNodesResult, deptId: string, data: Record<string, any>) {
    const found = deepFindOriginalDept(deptOriginal, deptId);
    if (found) {
        Object.assign(found, data);
    }
}

export function updateOriginalDeptStatus(deptOriginal: DeptTreeNodesResult, deptId: string, status: EnableStatus) {
    const found = deepFindOriginalDept(deptOriginal, deptId);
    if (found) {
        found.status = status;
    }
}

export function updateOriginalRole(deptOriginal: DeptTreeNodesResult, roleId: string, data: Record<string, any>) {
    const found = deepFindOriginalRole(deptOriginal, roleId);
    if (found) {
        Object.assign(found, data);
    }
}

export function updateOriginalRolePerms(
    deptOriginal: DeptTreeNodesResult,
    rootPermNode: PermNodeResult,
    roleId: string,
    perms: string[],
) {
    const found = deepFindOriginalRole(deptOriginal, roleId);
    if (found) {
        found.perms = filterPerms(rootPermNode, perms);
    }
}

export function updateOriginalRoleStatus(deptOriginal: DeptTreeNodesResult, roleId: string, status: EnableStatus) {
    const found = deepFindOriginalRole(deptOriginal, roleId);
    if (found) {
        found.status = status;
    }
}

export function filterDeletedDeptNodes(nodes: DeptTreeNodesResult[]) {
    const filterNodes = nodes.filter((n) => n.status !== "deleted");
    for (const node of filterNodes) {
        if (node.depts && node.depts.length) {
            node.depts = filterDeletedDeptNodes(node.depts);
        }
    }
    return filterNodes;
}

/**
 * 把 dept 和 dept.depts 提取到一个 string[] 里
 * @param dept
 */
export function extractAllDepts(dept: DeptTreeNodesResult) {
    const depts = [dept._id];
    for (const d of dept.depts) {
        depts.push(...extractAllDepts(d));
    }
    return depts;
}

/**
 * 把 dept 的所有 roles 提取到一个 string[] 里
 * @param dept
 */
export function extractAllRoles(dept: DeptTreeNodesResult) {
    const roles = dept.roles.map((role) => role._id);
    for (const d of dept.depts) {
        roles.push(...extractAllRoles(d));
    }
    return roles;
}
