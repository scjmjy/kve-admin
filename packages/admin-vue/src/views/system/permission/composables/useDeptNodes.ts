import { DeptTreeNodesResult } from "admin-common";

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

export function filterDeletedDeptNodes(node: DeptTreeNodesResult) {
    node.depts = node.depts.filter((dept) => dept.status !== "deleted");
    for (const n of node.depts) {
        filterDeletedDeptNodes(n);
    }
}
