import koa from "koa";
import CacheManager from "cache-manager";

const cache = CacheManager.caching({ store: "memory", max: 100, ttl: 1 * 60 * 60 * 24 /*1天*/ });

export { cache };

export function setupCache(app: koa) {
    app.context.cache = cache;
}
