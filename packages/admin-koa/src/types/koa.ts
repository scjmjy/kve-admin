import type { Request } from "koa";
import type { RouterContext } from "koa-router";
import type { AjaxResult } from "admin-common";

interface KoaRequest<RequestBodyT = any> extends Request {
    body?: RequestBodyT;
}

interface IRouterContext<StateT, ParamsT extends Record<string, string>> extends RouterContext<StateT> {
    params: ParamsT;
}

export interface KoaContext<
    RequestBodyT = any,
    ResponseDataT = any,
    StateT = any,
    ParamsT extends Record<string, string> = Record<string, string>,
    ResponseErrDataT = any,
> extends IRouterContext<StateT, ParamsT> {
    request: KoaRequest<RequestBodyT>;
    body: AjaxResult<ResponseDataT, ResponseErrDataT>;
}

// export interface KoaResponseContext<ResponseBody> extends KoaContext<any, ResponseBody> {}
