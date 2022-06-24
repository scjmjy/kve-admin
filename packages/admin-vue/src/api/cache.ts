import { AxiosPromise } from "axios";
import { CacheInfoResult } from "admin-common";
import { request } from "./request";

export function getCacheInfo(): AxiosPromise<CacheInfoResult> {
    return request({
        method: "GET",
        url: "/api/cache/info",
    });
}

export function clearCache(): AxiosPromise<void> {
    return request({
        method: "PUT",
        url: "/api/cache/clear",
    });
}
