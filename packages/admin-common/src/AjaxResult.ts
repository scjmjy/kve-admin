export type MsgShowType = "SILENT" | "MESSAGE" | "NOTIFICATION" | "FATAL";

export type AjaxResult<T = any, E = any> = {
    code: string | number;
    data?: T;
    errData?: E;
    showType?: MsgShowType;
    msg?: string;
};

export const MsgSilentHeader = "Message-Silent";

/**
 * 接口调用成功时，是否自动显示服务器提供的信息
 *
 * SUCCESS 调用成功时，不显示信息
 *
 * ERROR   调用失败时，不显示信息
 *
 * BOTH    调用成功或失败时，都不显示信息
 */
export type MsgSilent = "SUCCESS" | "ERROR" | "BOTH";
