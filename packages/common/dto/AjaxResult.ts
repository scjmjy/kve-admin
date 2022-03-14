export enum ErrorShowType {
    NONE,
    MESSAGE,
    NOTIFICATION,
    FATAL,
}

export interface AjaxResult {
    ok: boolean;
    code: string;
    showType: ErrorShowType;
    msg: string;
}
