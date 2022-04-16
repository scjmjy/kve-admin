import axios, { AxiosResponse, AxiosError, Axios } from "axios";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import { AjaxResult, MsgSilent, MsgSilentHeader } from "admin-common";
import { useUserStore } from "@/store/modules/user";

export const request = axios.create({
    baseURL: import.meta.env.VITE_AXIOS_BASE_API,
    timeout: 5000,
});

export function setTokenHeader(token: string) {
    if (token) {
        request.defaults.headers.common["Authorization"] = "Bearer " + token;
    } else {
        delete request.defaults.headers.common["Authorization"];
    }
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
        let msgSilent: MsgSilent | undefined;
        if (res.config.headers) {
            msgSilent = res.config.headers[MsgSilentHeader] as MsgSilent;
        }
        const body = res.data as AjaxResult;
        if (msgSilent !== "SUCCESS" && msgSilent !== "BOTH") {
            switch (body.showType) {
                case "MESSAGE":
                    ElMessage.success(body.msg);
                    break;
                case "NOTIFICATION":
                    ElNotification.success(body.msg);
                    break;
                case "SILENT":
                default:
                    // Does nothing.
                    break;
            }
        }
        return body;
    },
    async (err: AxiosError) => {
        // if (!isAxiosError(err)) {
        //     ElNotification.error("发生了一个未知的错误！");
        //     console.error("[AXIOS]", err.message);
        //     return Promise.reject(err);
        // }

        if (err.response) {
            // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
            let msgSilent: string | undefined;
            if (err.config.headers) {
                msgSilent = err.config.headers[MsgSilentHeader] as string;
            }
            const body = err.response.data as AjaxResult;
            if (msgSilent !== "SUCCESS" && msgSilent !== "BOTH") {
                switch (body.showType) {
                    case "MESSAGE":
                        ElMessage.error(body.msg);
                        break;
                    case "NOTIFICATION":
                        ElNotification.error(body.msg);
                        break;
                    case "FATAL":
                        // TODO Logout and Navigate to Login Page
                        try {
                            await ElMessageBox.confirm(body.msg || "xxx", "提示", {
                                type: "error",
                                confirmButtonText: "重新登录",
                                cancelButtonText: "忽略",
                                closeOnClickModal: false,
                            });
                            // 重新登录
                            const userStore = useUserStore();
                            await userStore.logout();
                        } catch (err) {
                            // 忽略错误
                        }
                        break;
                    case "SILENT":
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
