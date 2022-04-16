import { CreateUserBody } from "./../../../admin-common/src/user";
import { AxiosPromise } from "axios";
// import { MsgSilent, MsgSilentHeader } from "admin-common/AjaxResult";
import {
    FindUsersParams,
    FindUsersResult,
    LoginCredential,
    LoginResult,
    UserProfileResult,
    UpdateUserProfile,
    UpdateUserPassword,
    UpdateUserAvatar,
} from "admin-common";
import { request } from "./request";

export function login(credential: LoginCredential): AxiosPromise<LoginResult> {
    return request({
        method: "POST",
        url: "/api/login",
        data: credential,
        // headers: {
        //     [MsgSilentHeader]: "SUCCESS",
        // },
    });
}

export function getUserProfile(): AxiosPromise<UserProfileResult> {
    return request({
        method: "GET",
        url: "/api/user/profile",
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

export function getHelloworld() {
    return request({
        url: "/api/helloworld",
        method: "GET",
    });
}
