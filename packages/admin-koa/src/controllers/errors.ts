import { StatusCodes } from "http-status-codes";
import { AjaxResult, MsgShowType } from "admin-common";

export class AjaxError extends Error {
    constructor(
        public status: StatusCodes,
        public code: AjaxResult["code"],
        public showType: AjaxResult["showType"],
        message: string,
    ) {
        super(message);
    }
}

export function throwNotFoundError(msg: string, showType: MsgShowType = "MESSAGE") {
    throw new AjaxError(StatusCodes.NOT_FOUND, StatusCodes.NOT_FOUND, showType, msg);
}
export function throwUserNotFoundError(msg: string) {
    throw throwNotFoundError("用户不存在：" + msg);
}

export function throwBadRequestError(msg: string, showType: MsgShowType = "MESSAGE") {
    throw new AjaxError(StatusCodes.BAD_REQUEST, StatusCodes.BAD_REQUEST, showType, msg);
}

export function throwSessionError(msg: string, showType: MsgShowType = "FATAL") {
    throw new AjaxError(StatusCodes.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, showType, msg);
}

export function throwPermissionError(msg: string, showType: MsgShowType = "FATAL") {
    throw new AjaxError(StatusCodes.FORBIDDEN, StatusCodes.FORBIDDEN, showType, msg);
}
