export enum MsgShowType {
    SILENT = "SILENT",
    MESSAGE = "MESSAGE",
    NOTIFICATION = "NOTIFICATION",
    FATAL = "FATAL",
}

export type AjaxResult<T = any, E = any> = {
    code: string | number;
    data?: T;
    errData?: E;
    showType?: MsgShowType;
    msg?: string;
};

export const MsgSilentHeader = "Message-Silent";
// 接口调用成功时，是否自动显示服务器提供的信息
export enum MsgSilent {
    // 调用成功时，不显示信息
    SUCCESS = "SUCCESS",
    // 调用失败时，不显示信息
    ERROR = "ERROR",
    // 调用成功或失败时，都不显示信息
    BOTH = "BOTH",
}
