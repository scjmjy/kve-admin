import koa from "koa";
import { appConfig } from "@/config";
import CacheManager from "cache-manager";
import IoredisStore from "cache-manager-ioredis";
import Redis from "ioredis";
import ms from "ms";
import { SessionMaxAge } from "@/middlewares/session";

(Redis.prototype as Redis.Redis).hget_wrap = Redis.Cluster.prototype.hget_wrap = async function (
    this: Redis.Redis,
    key: Redis.KeyType,
    field: string,
    getter: () => Promise<string | null>,
) {
    const found = await this.hget(key, field);
    if (found) {
        return found;
    } else {
        const newItem = await getter();
        if (newItem) {
            await this.hset(key, field, newItem);
        }
        return newItem;
    }
};

export function setupCache(app: koa) {
    const redisClient = new Redis({
        ...appConfig.redis,
    });

    redisClient.on("error", function (err) {
        app.context.logger.info("[redis] error", err);
    });
    app.context.redisClient = redisClient;
    // const cache = CacheManager.caching({ store: "memory", max: 1000, ttl: Number.POSITIVE_INFINITY });
    app.context.redisCache = CacheManager.caching({
        store: IoredisStore,
        redisInstance: redisClient,
        ttl: SessionMaxAge.ms,
    });
}

declare module "cache-manager" {
    interface Store {
        getClient(): Redis.Redis | Redis.Cluster;
    }
}

declare module "ioredis" {
    interface Commands {
        hget_wrap(key: KeyType, field: string, getter: () => Promise<string | null>): Promise<string | null>;
    }
}
