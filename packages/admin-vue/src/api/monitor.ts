import { AxiosPromise } from "axios";
import { CacheInfoResult, MetricTimelines } from "admin-common";
import { request } from "./request";

export function getCacheInfo(): AxiosPromise<CacheInfoResult> {
    return request({
        method: "GET",
        url: "/api/monitor/cache",
    });
}

export function clearCache(): AxiosPromise<void> {
    return request({
        method: "DELETE",
        url: "/api/monitor/cache",
    });
}

export function getMetrics(): AxiosPromise<MetricTimelines> {
    return request({
        method: "GET",
        url: "/api/monitor/metric",
    });
}
