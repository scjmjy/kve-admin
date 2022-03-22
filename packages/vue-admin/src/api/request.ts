import { AjaxResult, MsgShowType, MsgSilent, MsgSilentHeader } from "@common/AjaxResult";
import axios, { AxiosResponse, AxiosError, Axios } from "axios";
import { ElMessage, ElNotification } from "element-plus";

// axios.defaults.headers.post["Content-Type"] = "application/json;charset=utf-8";

export const request = axios.create({
    baseURL: import.meta.env.VITE_AXIOS_BASE_API,
    timeout: 5000,
});

export function setTokenHeader(token: string) {
    request.defaults.headers.common["Authorization"] = "Bearer " + token;
}

request.interceptors.request.use(
    (config) => {
        if (!config.headers) config.headers = {};
        return config;
    },
    (err) => {
        console.error("[AXIOS]", err.message);
        return Promise.reject(err);
    },
);

// function isAxiosError(err: any): err is AxiosError {
//     return err.isAxiosError;
// }

request.interceptors.response.use(
    (res) => {
        let msgSilent = "";
        if (res.config.headers) {
            msgSilent = res.config.headers[MsgSilentHeader] as string;
        }
        const body = res.data as AjaxResult;
        if (!(msgSilent === MsgSilent.SUCCESS || msgSilent === MsgSilent.BOTH)) {
            switch (body.showType) {
                case MsgShowType.MESSAGE:
                    ElMessage.success(body.msg);
                    break;
                case MsgShowType.NOTIFICATION:
                    ElNotification.success(body.msg);
                    break;
                case MsgShowType.SILENT:
                default:
                    // Does nothing.
                    break;
            }
        }
        return body;
    },
    (err: AxiosError) => {
        // if (!isAxiosError(err)) {
        //     ElNotification.error("发生了一个未知的错误！");
        //     console.error("[AXIOS]", err.message);
        //     return Promise.reject(err);
        // }

        if (err.response) {
            // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
            let msgSilent = "";
            if (err.config.headers) {
                msgSilent = err.config.headers[MsgSilentHeader] as string;
            }
            const body = err.response.data as AjaxResult;
            if (!(msgSilent === MsgSilent.ERROR || msgSilent === MsgSilent.BOTH)) {
                switch (body.showType) {
                    case MsgShowType.MESSAGE:
                        ElMessage.error(body.msg);
                        break;
                    case MsgShowType.NOTIFICATION:
                        ElNotification.error(body.msg);
                        break;
                    case MsgShowType.FATAL:
                        // TODO Logout and Navigate to Login Page
                        break;
                    case MsgShowType.SILENT:
                    default:
                        // Does nothing.
                        break;
                }
            }
            return Promise.reject(body);
        } else if (err.request) {
            // err.request = XMLHttpRequest
            // 请求已经成功发起，但没有收到响应
            const body: AjaxResult = {
                code: "",
            };
            const { message, code } = err;
            if (message === "Network Error") {
                ElNotification.error("电脑已脱机，请接入网络！");
                body.code = "ERR_NETWORK";
            } else if (code === "ETIMEOUT" || code === "ECONNABORTED") {
                body.code = "ERR_TIMEOUT";
                ElNotification.error("连接超时，服务器不可用！");
            }
            return Promise.reject(body);
        } else {
            // 发送请求时出了点问题
            console.error("[AXIOS]", err.message);
            ElNotification.error("发生了一个未知的错误！");
            const body: AjaxResult = {
                code: "ERR_UNKNOWN",
            };
            return Promise.reject(body);
        }
    },
);
