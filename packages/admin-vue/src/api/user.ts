import { AxiosPromise } from "axios";
// import { MsgSilent, MsgSilentHeader } from "admin-common/AjaxResult";
import {
    CreateUserBody,
    UpdateUserBody,
    FindUsersParams,
    FindUsersResult,
    LoginCredential,
    LoginResult,
    UserProfileResult,
    UpdateUserProfile,
    UpdateUserPassword,
    UpdateUserAvatar,
    UserIdsBody,
} from "admin-common";
import { request } from "./request";
import { CaptchaResult, OnlineUsersResult } from "admin-common/src/user";

export function getCaptcha(prevId?: string): AxiosPromise<CaptchaResult> {
    return request({
        method: "GET",
        url: "/api/captcha?prev=" + prevId,
    });
}

export function login(credential: LoginCredential): AxiosPromise<LoginResult> {
    return request({
        method: "POST",
        url: "/api/user/login",
        data: credential,
        // headers: {
        //     [MsgSilentHeader]: "SUCCESS",
        // },
    });
}

export function logout(): AxiosPromise<LoginResult> {
    return request({
        method: "DELETE",
        url: "/api/user/logout",
        timeout: 1000,
    });
}

export function getUserProfile(perms = false): AxiosPromise<UserProfileResult> {
    return request({
        method: "GET",
        url: "/api/user/profile",
        params: {
            perms: perms ? "true" : "",
        },
    });
}

export function updateUserProfile(body: UpdateUserProfile): AxiosPromise<void> {
    return request({
        method: "PUT",
        url: "/api/user/profile",
        data: body,
    });
}

export function updateUserPassword(body: UpdateUserPassword): AxiosPromise<void> {
    return request({
        method: "PUT",
        url: "/api/user/password",
        data: body,
    });
}

export function uploadUserAvatar(base64: string): AxiosPromise<void> {
    return request({
        method: "PUT",
        url: "/api/user/avatar",
        data: {
            avatar: base64,
        } as UpdateUserAvatar,
    });
}

export function getUserList(params: FindUsersParams): AxiosPromise<FindUsersResult> {
    return request({
        method: "POST",
        url: "/api/user/list",
        data: params,
    });
}

export function createUser(user: CreateUserBody): AxiosPromise<CreateResult> {
    return request({
        method: "POST",
        url: "/api/user",
        data: user,
    });
}

export function updateUser(user: UpdateUserBody): AxiosPromise<void> {
    return request({
        method: "PUT",
        url: "/api/user",
        data: user,
    });
}

export function enableUsers(ids: string[], status: EnableStatus): AxiosPromise<void> {
    return request({
        method: "PUT",
        url: "/api/user/status/" + status,
        data: {
            ids,
        } as UserIdsBody,
    });
}

export function deleteUser(userId: string): AxiosPromise<void> {
    return request({
        method: "DELETE",
        url: "/api/user/" + userId,
    });
}

export function getOnlineUsers(): AxiosPromise<OnlineUsersResult> {
    return request({
        method: "GET",
        url: "/api/user/list/online",
    });
}

export function forceLogout(sessionId: string): AxiosPromise<void> {
    return request({
        method: "DELETE",
        url: "/api/user/list/online/forceLogout/" + sessionId,
    });
}
