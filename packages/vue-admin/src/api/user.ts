import { AxiosPromise } from "axios";
import { MsgSilent, MsgSilentHeader } from "@common/AjaxResult";
import { LoginCredential, LoginResult } from "@common/login";
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

export function getHelloworld() {
    return request({
        url: "/api/helloworld",
        method: "GET",
    });
}
