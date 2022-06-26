import koa from "koa";
import { appConfig } from "@/config";
import Redis, { RedisKey } from "ioredis";

// interface RedisGetOpts {
//     ttl_ms?: number;
//     returnOld?: boolean;
// }

// Redis.prototype.set_wrap = Redis.Cluster.prototype.set_wrap = async function (
//     this: Redis,
//     key: RedisKey,
//     value: any,
//     opts?: number | RedisGetOpts,
// ) {
//     if (opts) {
//         if (typeof opts === "number") {
//             return this.set(key);
//         }
//     }
//     const found = await this.set(key);
//     if (found) {
//         return found;
//     } else {
//         const newItem = await getter();
//         if (newItem) {
//             await this.set(key, newItem);
//         }
//         return newItem;
//     }
// };
// Redis.prototype.get_wrap = Redis.Cluster.prototype.get_wrap = async function (
//     this: Redis,
//     key: RedisKey,
//     getter: () => Promise<string | null>,
// ) {
//     const found = await this.get(key);
//     if (found) {
//         return found;
//     } else {
//         const newItem = await getter();
//         if (newItem) {
//             await this.hset(key, newItem);
//         }
//         return newItem;
//     }
// };

// Redis.prototype.hget_wrap = Redis.Cluster.prototype.hget_wrap = async function (
//     this: Redis,
//     key: RedisKey,
//     field: string,
//     getter: () => Promise<string | null>,
// ) {
//     const found = await this.hget(key, field);
//     if (found) {
//         return found;
//     } else {
//         const newItem = await getter();
//         if (newItem) {
//             await this.hset(key, field, newItem);
//         }
//         return newItem;
//     }
// };

export function setupCache(app: koa) {
    const redisClient = new Redis({
        ...appConfig.redis,
    });

    redisClient.on("error", function (err) {
        app.context.logger.info("[redis] error", err);
    });
    app.context.redisClient = redisClient;
}

declare module "ioredis" {
    // interface RedisCommander {
    //     set_wrap(
    //         key: RedisKey,
    //         value: string | number | Buffer | Record<string, any>,
    //         ttl_ms?: number,
    //     ): Promise<number>;
    //     get_wrap(key: RedisKey, getter: () => Promise<string | null>, ttl_ms?: number): Promise<string | null>;
    //     hget_wrap(key: RedisKey, field: string, getter: () => Promise<string | null>): Promise<string | null>;
    // }
}
