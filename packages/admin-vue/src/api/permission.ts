import { AxiosPromise } from "axios";
import {
    PermNodeResult,
    CreateMenuActionBody,
    CreateMenuGroupBody,
    CreateMenuItemBody,
    UpdateMenuActionBody,
    UpdateMenuGroupBody,
    UpdateMenuItemBody,
    GetPermNodeQuery,
} from "admin-common";
import { request } from "./request";

export function getPermNodes(query?: GetPermNodeQuery): AxiosPromise<PermNodeResult> {
    return request({
        method: "GET",
        url: "/api/perm/tree",
        params: query || {},
    });
}

export function createPerm(
    body: CreateMenuActionBody | CreateMenuGroupBody | CreateMenuItemBody,
): AxiosPromise<CreateResult> {
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

export function dragDropPerms(body: DragDropBody): AxiosPromise<PermNodeResult | undefined> {
    return request({
        method: "POST",
        url: "/api/perm/drag-drop",
        data: body,
    });
}
