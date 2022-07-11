import { AxiosPromise } from "axios";
import {
    CreateRoleBody,
    DeptTreeNodesResult,
    ReorderRolesBody,
    UpdateRoleBody,
    CreateDeptBody,
    UpdateDeptBody,
    UpdateRolePermsBody,
} from "admin-common";
import { request } from "./request";

export function getDeptTreeNodes(): AxiosPromise<DeptTreeNodesResult> {
    return request({
        method: "GET",
        url: "/api/dept/tree",
    });
}

export function createDept(body: CreateDeptBody): AxiosPromise<CreateResult> {
    return request({
        method: "POST",
        url: "/api/dept",
        data: body,
    });
}

export function updateDept(body: UpdateDeptBody): AxiosPromise<void> {
    return request({
        method: "PUT",
        url: "/api/dept",
        data: body,
    });
}

export function enableDept(deptId: string, status: EnableStatus): AxiosPromise<void> {
    return request({
        method: "PUT",
        url: `/api/dept/status/${deptId}/${status}`,
    });
}

export function createRole(role: CreateRoleBody): AxiosPromise<CreateResult> {
    return request({
        method: "POST",
        url: "/api/role",
        data: role,
    });
}

export function updateRole(role: UpdateRoleBody): AxiosPromise<void> {
    return request({
        method: "PUT",
        url: "/api/role",
        data: role,
    });
}

export function enableRole(roleId: string, status: EnableStatus): AxiosPromise<void> {
    return request({
        method: "PUT",
        url: `/api/role/status/${roleId}/${status}`,
    });
}

export function dragDropDepts(body: DragDropBody): AxiosPromise<DeptTreeNodesResult | undefined> {
    return request({
        method: "POST",
        url: "/api/dept/drag-drop",
        data: body,
    });
}

export function reorderRoles(body: ReorderRolesBody): AxiosPromise<void> {
    return request({
        method: "POST",
        url: "/api/role/reorder",
        data: body,
    });
}

export function updateRolePerms(perms: UpdateRolePermsBody): AxiosPromise<void> {
    return request({
        method: "PUT",
        url: "/api/role/perm",
        data: perms,
    });
}
