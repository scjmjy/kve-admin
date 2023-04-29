import { CacheInfoItem, CacheInfoResult } from "admin-common";
import { StatusCodes } from "http-status-codes";

export interface CacheInfo {
    [section: string]: CacheInfoItem[];
}

type FilterOption = {
    key: string | string[];
    transform(val: string | string[]): CacheInfoItem;
};

type Filter = {
    [section: string]: FilterOption[];
};

const cacheInfoFilter: Filter = {
    Server: [
        {
            key: "redis_version",
            transform(val: string) {
                return {
                    label: "Redis 版本",
                    value: val,
                };
            },
        },
        {
            key: "redis_mode",
            transform(val: string) {
                return {
                    label: "运行模式",
                    value: val,
                };
            },
        },
        {
            key: "uptime_in_days",
            transform(val: string) {
                return {
                    label: "运行时长",
                    value: val + "天",
                };
            },
        },
        {
            key: "tcp_port",
            transform(val: string) {
                return {
                    label: "运行端口",
                    value: val,
                };
            },
        },
        {
            key: "tcp_port",
            transform(val: string) {
                return {
                    label: "监听端口",
                    value: val,
                };
            },
        },
    ],
    Clients: [
        {
            key: "connected_clients",
            transform(val: string) {
                return {
                    label: "客户端数",
                    value: val,
                };
            },
        },
    ],
    Memory: [
        {
            key: "used_memory_human",
            transform(val: string) {
                return {
                    label: "使用内存",
                    value: val,
                };
            },
        },
        {
            key: "maxmemory_human",
            transform(val: string) {
                return {
                    label: "配置内存",
                    value: val,
                };
            },
        },
    ],
    CPU: [
        {
            key: ["used_cpu_sys", "used_cpu_user"],
            transform(val: string[]) {
                return {
                    label: "CPU sys/user",
                    value: `${val[0]}/${val[1]}`,
                };
            },
        },
    ],
    Persistence: [
        {
            key: "aof_enabled",
            transform(val: string) {
                return {
                    label: "启用 AOF",
                    value: val === "0" ? "否" : "是",
                };
            },
        },
        {
            key: "rdb_last_bgsave_status",
            transform(val: string) {
                return {
                    label: "RDB 状态",
                    value: val === "ok" ? "成功" : "失败",
                };
            },
        },
    ],
    Stats: [
        {
            key: ["instantaneous_input_kbps", "instantaneous_output_kbps"],
            transform(val: string[]) {
                return {
                    label: "网络入/出",
                    value: `${val[0]}kps/${val[1]}kps`,
                };
            },
        },
    ],
    Keyspace: [
        {
            key: "db0",
            transform(val: string) {
                const keys = val.split(",")[0];
                const count = keys.split("=")[1];
                return {
                    label: "Key 数量",
                    value: count,
                };
            },
        },
    ],
};

export const getCacheInfo: RestAjaxMiddleware<void, CacheInfoResult> = async (ctx) => {
    const info = await ctx.redisClient.info("all");
    const fieldValues = info.split("\r\n");
    const cacheInfo: CacheInfo = {};
    let lastSection = "";
    fieldValues.forEach((str) => {
        if (str.startsWith("# ")) {
            lastSection = str.slice(2);
            cacheInfo[lastSection] = [];
        } else if (str) {
            const info: CacheInfoItem[] = cacheInfo[lastSection];
            const fieldValue = str.split(":");
            info.push({
                label: fieldValue[0],
                value: fieldValue[1],
            });
        }
    });
    const result: CacheInfoResult = {
        items: [],
        columns: [
            {
                label: "命令名称",
                prop: "cmd_name",
            },
            {
                label: "调用次数",
                prop: "calls",
            },
            {
                label: "耗时(μs)",
                prop: "usec",
            },
            {
                label: "平均耗时(μs)",
                prop: "usec_per_call",
            },
            {
                label: "拒绝次数",
                prop: "rejected_calls",
            },
            {
                label: "失败次数",
                prop: "failed_calls",
            },
        ],
        rows: [],
    };
    let section: keyof typeof cacheInfoFilter;
    for (section in cacheInfoFilter) {
        const filter = cacheInfoFilter[section];
        const items = cacheInfo[section];
        if (!items) {
            continue;
        }
        for (const option of filter) {
            if (Array.isArray(option.key)) {
                const values: string[] = [];
                option.key.forEach((key) => {
                    const val = items.find((item) => item.label === key);
                    val && values.push(val.value);
                });
                values.length === option.key.length && result.items.push(option.transform(values));
            } else {
                const val = items.find((item) => item.label === option.key);
                val && result.items.push(option.transform(val.value));
            }
        }
    }
    const Commandstats = cacheInfo["Commandstats"];

    if (Commandstats) {
        for (const cmd of Commandstats) {
            const value = cmd.value;
            const stats = value.split(",").map((keyVal) => keyVal.split("="));
            const row: Record<string, number | string> = {
                cmd_name: cmd.label,
            };
            result.rows.push(row);
            result.columns.forEach((col, index) => {
                if (index === 0) {
                    return;
                }
                const stat = stats.find((stat) => stat[0] === col.prop);
                stat && (row[stat[0]] = Number(stat[1]));
            });
        }
    }
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        data: result,
    };
};

export const clearCache: RestAjaxMiddleware = async (ctx) => {
    await ctx.redisClient.flushdb("ASYNC");
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: "清空缓存成功！",
    };
}
