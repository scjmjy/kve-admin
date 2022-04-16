import type { Request } from "koa";
import type { RouterContext } from "koa-router";
import type { AjaxResult } from "admin-common";

interface KoaRequest<RequestBodyT = any> extends Request {
    body?: RequestBodyT;
}

interface IRouterContext<StateT, ParamsT extends Record<string, string>> extends RouterContext<StateT> {
    params: ParamsT;
}

export interface KoaAjaxContext<
    RequestBodyT = any,
    ResponseDataT = any,
    StateT = any,
    ParamsT extends Record<string, string> = Record<string, string>,
    ResponseErrDataT = any,
> extends IRouterContext<StateT, ParamsT> {
    request: KoaRequest<RequestBodyT>;
    body: AjaxResult<ResponseDataT, ResponseErrDataT>;
}

export interface KoaContext<
    RequestBodyT = any,
    ResponseBodyT = any,
    StateT = any,
    ParamsT extends Record<string, string> = Record<string, string>,
> extends IRouterContext<StateT, ParamsT> {
    request: KoaRequest<RequestBodyT>;
    body: ResponseBodyT;
}
