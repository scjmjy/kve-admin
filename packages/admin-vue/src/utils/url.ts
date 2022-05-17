import { isExternalLink } from "./is";

export function normalizePath(parentPath: string, childPath: string) {
    if (isExternalLink(childPath) || childPath.startsWith("/")) {
        // 外链，或者 绝对地址
        return childPath;
    } else if (parentPath.endsWith("/")) {
        return `${parentPath}${childPath}`;
    } else {
        return `${parentPath}/${childPath}`;
    }
}
