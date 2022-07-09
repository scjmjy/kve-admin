export enum PERM_CODES {
    root = "/",
    system = "/system",
    system_usermanage = "/system/usermanage",
    system_menumanage = "/system/menumanage",
    monitor = "/monitor",
    monitor_cachemanage = "/monitor/cachemanage",
    monitor_cachemanage_clear = "/monitor/cachemanage/clear",
    monitor_onlineusers = "/monitor/onlineusers",
    monitor_onlineusers_forceLogout = "/monitor/onlineusers/forceLogout",
    monitor_metric = "/monitor/metric",
    monitor_log = "/monitor/log",
    monitor_log_clearAccess = "/monitor/log/clear/access",
    monitor_log_clearOp = "/monitor/log/clear/operation",
    monitor_log_clearDebug = "/monitor/log/clear/debug",

    demoPerm_group = "/demoPerm/group",
    demoPerm_group_action1 = "/demoPerm/group/action1",
    demoPerm_group_action2 = "/demoPerm/group/action2",
}

export type PermMatchMode = "every" | "some" | "none";

export function hasPerm(allPerms: string[], perms: string | string[], mode: PermMatchMode): boolean {
    if (allPerms.includes(PERM_CODES.root)) {
        return true;
    }
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
