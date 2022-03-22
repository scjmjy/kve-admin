import type { ParameterizedContext, Request } from "koa";
import type { AjaxResult } from '@common/AjaxResult';

interface KoaRequest<RequestBodyT = any> extends Request {
    body?: RequestBodyT;
}

export interface KoaContext<RequestBodyT = any, ResponseDataT = any> extends ParameterizedContext {
    request: KoaRequest<RequestBodyT>;
    body: AjaxResult<ResponseDataT>;
}

// export interface KoaResponseContext<ResponseBody> extends KoaContext<any, ResponseBody> {}
