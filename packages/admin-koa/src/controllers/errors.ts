import { StatusCodes } from "http-status-codes";
import { AjaxResult, MsgShowType } from "admin-common";
// import { ParameterizedContext } from "koa";

// export function error404(ctx: ParameterizedContext) {
//     ctx.response.status = 404;
//     ctx.response.body = "404 Error";
// }

export class NotFoundError extends Error {
    constructor(public code: AjaxResult["code"], public showType: AjaxResult["showType"], message: string) {
        super(message);
    }
}

export function throwNotFoundError(
    code: AjaxResult["code"],
    message: string,
    showType: AjaxResult["showType"] = MsgShowType.MESSAGE,
) {
    throw new NotFoundError(code, showType, message);
}

export function throwUserNotFoundError() {
    throw new NotFoundError(StatusCodes.NOT_FOUND, MsgShowType.MESSAGE, "用户不存在");
}
