export enum PERM_CODES {
    root = "/",
    system = "/system",
    system_usermanage = "/system/usermanage",
    system_menumanage = "/system/menumanage",
    system_cachemanage = "/system/cachemanage",
    system_cachemanage_clear = "/system/cachemanage/clear",
    system_onlineusers = "/system/onlineusers",

    demoPerm_group = "/demoPerm/group",
    demoPerm_group_action1 = "/demoPerm/group/action1",
    demoPerm_group_action2 = "/demoPerm/group/action2",
}

export type PermMatchMode = "every" | "some" | "none";

export function hasPerm(allPerms: string[], perms: string | string[], mode: PermMatchMode): boolean {
    perms = Array.isArray(perms) ? perms : [perms];
    switch (mode) {
        case "every":
            return !!perms.length && perms.every((item) => allPerms.includes(item));
        case "some":
            return perms.some((item) => allPerms.includes(item));
        case "none":
            return !perms.some((item) => allPerms.includes(item));
        default:
            throw new Error("无效的权限匹配模式：" + mode);
    }
}
