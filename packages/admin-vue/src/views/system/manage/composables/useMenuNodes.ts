import { PermNodeResult } from "admin-common";
import { inject, Ref } from "vue";

export const symbolFetchPerm = Symbol("symbol.perm.fetch");
export const symbolPermOriginal = Symbol("symbol.perm.original");
export const symbolResetPermCurrentKey = Symbol("symbol.perm.tree.currentkey");

export function usePermInject() {
    return {
        permOriginal: inject<Ref<PermNodeResult>>(symbolPermOriginal)!,
        fetchPerm: inject<() => Promise<void>>(symbolFetchPerm)!,
        resetPermCurrentKey: inject<(permId?: string) => void>(symbolResetPermCurrentKey)!,
    };
}

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

export function updateOriginalMenu(permOriginal: PermNodeResult, permId: string, data: Record<string, any>) {
    const found = deepFindMenu([permOriginal], permId);
    if (found) {
        Object.assign(found, data);
    }
}

export function updateOriginalMenuStatus(permOriginal: PermNodeResult, permId: string, status: EnableStatus) {
    const found = deepFindMenu([permOriginal], permId);
    if (found) {
        found.status = status;
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

export function makePermTreeSelectOpts(rootPermNode: PermNodeResult) {
    const { children = [] } = rootPermNode;
    return convertPermNode2SelectOpts(children);
}

export interface PermTreeOption {
    label: string;
    value: string;
    children?: PermTreeOption[];
}

function convertPermNode2SelectOpts(nodes: PermNodeResult[]) {
    const opts: PermTreeOption[] = nodes.map((node) => {
        const opt: PermTreeOption = { label: node.title || "", value: node._id };
        if (node.children) {
            opt.children = convertPermNode2SelectOpts(node.children);
        }
        return opt;
    });
    return opts;
}

export function filterPerms(node: PermNodeResult, perms: string[]) {
    const result: PermNodeResult[] = [];
    if (perms.includes(node._id)) {
        result.push(node);
    }

    for (const n of node.children || []) {
        const found = filterPerms(n, perms);
        if (found) {
            result.push(...found);
        }
    }
    return result;
}

export function extractAllPermIds(node: PermNodeResult) {
    const ids = [node._id];
    for (const n of node.children || []) {
        ids.push(...extractAllPermIds(n));
    }
    return ids;
}

export function sortPermIds(source: string[], orders: string[]) {
    source.sort((a, b) => {
        return orders.indexOf(a) - orders.indexOf(b);
    });
}
