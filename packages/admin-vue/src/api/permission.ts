import { AxiosPromise } from "axios";
import {
    PermNodeResult,
    CreateMenuActionBody,
    CreateMenuGroupBody,
    CreateMenuItemBody,
    UpdateMenuActionBody,
    UpdateMenuGroupBody,
    UpdateMenuItemBody,
} from "admin-common";
import { request } from "./request";

export function getPermNodes(): AxiosPromise<PermNodeResult> {
    return request({
        method: "GET",
        url: "/api/perm/tree",
    });
}

export function createPerm(body: CreateMenuActionBody | CreateMenuGroupBody | CreateMenuItemBody): AxiosPromise<CreateResult> {
    return request({
        method: "POST",
        url: "/api/perm",
        data: body,
    });
}

export function updatePerm(body: UpdateMenuActionBody | UpdateMenuGroupBody | UpdateMenuItemBody): AxiosPromise<void> {
    return request({
        method: "PUT",
        url: "/api/perm",
        data: body,
    });
}

export function enablePerm(permId: string, status: EnableStatus): AxiosPromise<void> {
    return request({
        method: "PUT",
        url: `/api/perm/status/${permId}/${status}`,
    });
}
