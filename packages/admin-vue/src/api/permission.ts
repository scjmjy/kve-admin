import { AxiosPromise } from "axios";
import { DeptTreeNodesResult } from "admin-common";
import { request } from "./request";

export function getDeptTreeNodes(): AxiosPromise<DeptTreeNodesResult> {
    return request({
        method: "GET",
        url: "/api/dept/tree",
    });
}
