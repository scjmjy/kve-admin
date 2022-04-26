import { PermNodeResult } from "admin-common";

export function deepFindMenu(nodes: PermNodeResult[], id: string): PermNodeResult | undefined {
    for (const n of nodes) {
        if (n._id === id) {
            return n;
        } else if (n.children && n.children.length) {
            const found = deepFindMenu(n.children, id);
            if (found) {
                return found;
            }
        }
    }
}

export function filterDeletedMenuNodes(nodes: PermNodeResult[]) {
    const filterNodes = nodes.filter((n) => n.status !== "deleted");
    for (const node of filterNodes) {
        if (node.children && node.children.length) {
            node.children = filterDeletedMenuNodes(node.children);
        }
    }
    return filterNodes;
}
