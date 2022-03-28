import { AxiosPromise } from "axios";
// import { MsgSilent, MsgSilentHeader } from "admin-common/AjaxResult";
import { LoginCredential, LoginResult, UserProfileResult } from "admin-common";
import { request } from "./request";

export function login(credential: LoginCredential): AxiosPromise<LoginResult> {
    return request({
        method: "POST",
        url: "/api/login",
        data: credential,
        // headers: {
        //     [MsgSilentHeader]: MsgSilent.SUCCESS,
        // },
    });
}

export function getUserProfile(): AxiosPromise<UserProfileResult> {
    return request({
        method: "GET",
        url: "/api/user/profile",
    });
}

export function getHelloworld() {
    return request({
        url: "/api/helloworld",
        method: "GET",
    });
}
