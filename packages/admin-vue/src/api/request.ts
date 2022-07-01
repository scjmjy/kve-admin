import Cookies from "js-cookie";
import axios, { AxiosError } from "axios";
import { ElMessage, ElMessageBox, ElNotification, UploadUserFile, UploadFile, genFileId } from "element-plus";
import { AjaxResult, getBase64Type, isBase64, MsgSilent, MsgSilentHeader } from "admin-common";
import { useUserStore } from "@/store/modules/user";
import { convertBlobToBase64, getTypeFromName } from "@/utils/file";

export const request = axios.create({
    baseURL: import.meta.env.VITE_AXIOS_BASE_API,
    timeout: 60000, // 60秒 超时时间，如果服务器响应慢或上传文件很大，则提高此数值
});

export function setTokenHeader(token: string) {
    if (token) {
        // request.defaults.headers.common["Authorization"] = "Bearer " + token;
        Cookies.set("Authorization", token);
    } else {
        // delete request.defaults.headers.common["Authorization"];
        Cookies.remove("Authorization");
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
        if (!res.data.data) {
            // 后端没有用 AjaxResult，例如静态文件，此时直接返回 res
            return res;
        }
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
            if (!err.response.data) {
                // 后端没有用 AjaxResult
                return Promise.reject(err);
            }
            // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
            let msgSilent: string | undefined;
            if (err.config.headers) {
                msgSilent = err.config.headers[MsgSilentHeader] as string;
            }
            let body = err.response.data as AjaxResult;
            if (err.response.data instanceof Blob) {
                const parsedBody = await new Promise<AjaxResult | undefined>((resolve) => {
                    const reader = new FileReader();
                    // @ts-ignore
                    reader.readAsText(err.response!.data);
                    reader.onload = function (ev) {
                        resolve(JSON.parse(ev.target!.result as string));
                    };
                    reader.onerror = function () {
                        resolve(undefined);
                    };
                });
                if (parsedBody) {
                    body = parsedBody;
                }
            }
            if (msgSilent !== "SUCCESS" && msgSilent !== "BOTH") {
                switch (body.showType) {
                    case "MESSAGE":
                        ElMessage.error(body.msg);
                        break;
                    case "NOTIFICATION":
                        ElNotification.error(body.msg);
                        break;
                    case "FATAL":
                        try {
                            await ElMessageBox.confirm(body.msg || "发生了一个错误，需要重新登录", "提示", {
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

export interface MakeFormDataOption {
    /**
     * 把文件内容转为 base64 格式，内联到 mongodb document 里
     *
     * 默认： false
     * */
    inline?: boolean;
    /**
     * 字段为数组类型
     *
     * 默认：false
     * */
    array?: boolean;
    /**
     * 当 inline=false 时， 此字段才有效
     *
     * - useKeyAsName=true 时，Content-Disposition 中 name 的值为 data 的 key
     * - useKeyAsName=true 时，name 为 ‘file’
     *
     * 默认：false
     */
    useKeyAsName?: boolean;
}

export type FormDataOptions<T> = Partial<Record<keyof T, MakeFormDataOption>>;

/**
 * 把 <el-form> 的值 转换为 ajax 的 FormData
 */
export async function makeFormData<T extends Record<string, any>>(data: T, options?: FormDataOptions<T>) {
    const formData = new FormData();
    for (const key in data) {
        if (options && key in options) {
            const option = options[key]!;
            let value = data[key] as UploadFile[];
            if (!Array.isArray(value)) {
                console.error("[makeFormData] 期望 GridFsFile[] 类型：" + key);
                continue;
            }
            if (option.inline) {
                if (!option.array && value.length) {
                    value = [value[0]];
                }
                const fieldValue: GridFsFile[] = [];
                for (const file of value) {
                    if (file.raw) {
                        const base64 = await convertBlobToBase64(file.raw);
                        fieldValue.push({
                            name: file.name,
                            size: file.size || 0,
                            mimetype: getBase64Type(base64),
                            url: base64,
                        });
                    } else if (isBase64(file.url || "")) {
                        fieldValue.push({
                            name: file.name,
                            size: file.size || 0,
                            mimetype: getBase64Type(file.url!),
                            url: file.url!,
                        });
                    } else {
                        console.error("[makeFormData] 期望 UploadFile.raw 或 base64 ：" + key);
                    }
                }
                if (option.array) {
                    formData.append(key, JSON.stringify(fieldValue));
                } else {
                    formData.append(key, JSON.stringify(fieldValue[0]));
                }
            } else {
                if (!option.array && value.length) {
                    value = [value[0]];
                }
                const fieldName = option.useKeyAsName ? key : "file";
                const existingFiles: GridFsFile[] = [];
                value.forEach((file: UploadFile) => {
                    if (file.raw) {
                        formData.append(fieldName, file.raw, file.name);
                    } else {
                        existingFiles.push({
                            name: file.name,
                            size: file.size || 0,
                            mimetype: getTypeFromName(file.name),
                            url: file.url!,
                        });
                    }
                });
                if (option.array) {
                    formData.append(key, JSON.stringify(existingFiles));
                } else {
                    formData.append(key, JSON.stringify(existingFiles[0]));
                }
            }
        } else {
            const value = data[key];
            formData.append(key, JSON.stringify(value));
        }
    }
    return formData;
}

/**
 * 把后台的数据解析成可用于 <el-form> <BasicUpload> 的数据
 */
export function parseFormData<T extends Record<string, any>>(data: T, options: FormDataOptions<T>) {
    const result = {} as Record<keyof T, any>;
    for (const key in data) {
        if (key in options) {
            let value = data[key] as GridFsFile | GridFsFile[];
            if (!Array.isArray(value)) {
                value = [value];
            }
            const fileList: UploadUserFile[] = [];
            for (const item of value) {
                fileList.push({
                    name: item.name,
                    size: item.size,
                    url: item.url,
                    uid: genFileId(),
                });
            }
            result[key] = fileList;
        } else {
            result[key] = data[key];
        }
    }
    return result;
}
