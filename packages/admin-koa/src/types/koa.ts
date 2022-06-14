import type { Request } from "koa";
import type { RouterContext } from "koa-router";
import type { AjaxResult } from "admin-common";
import { ParsedUrlQuery } from "querystring";
import log4js from "log4js";

/**
 * token 中加密的数据
 */
export interface JwtPayload {
    id: string;
}

/**
 * token 解码后，通过 ctx.state.user 获取其内容
 */
export interface JwtState {
    user: JwtPayload;
}

interface KoaRequest<RequestBodyT = any> extends Request {
    body?: RequestBodyT;
}

interface IRouterContext<ParamsT extends Record<string, string>, QueryT extends ParsedUrlQuery> extends RouterContext {
    params: ParamsT;
    query: QueryT;
}

export interface KoaAjaxContext<
    RequestBodyT = any,
    ResponseDataT = any,
    ParamsT extends Record<string, string> = Record<string, string>,
    QueryT extends ParsedUrlQuery = ParsedUrlQuery,
    ResponseErrDataT = any,
> extends IRouterContext<ParamsT, QueryT> {
    request: KoaRequest<RequestBodyT>;
    body: AjaxResult<ResponseDataT, ResponseErrDataT>;
}

export interface KoaContext<
    RequestBodyT = any,
    ResponseBodyT = any,
    ParamsT extends Record<string, string> = Record<string, string>,
    QueryT extends ParsedUrlQuery = ParsedUrlQuery,
> extends IRouterContext<ParamsT, QueryT> {
    request: KoaRequest<RequestBodyT>;
    body: ResponseBodyT;
}

export interface AppConfig {
    /**
     * 工作目录
     * workDir
     * ├── js/
     * │   ├── index.js
     * │   ├── ...
     * ├── public/
     * │   ├── static/
     * │   ├── assets/
     * │   ├── favicon.ico
     * │   ├── index.html
     * │   ├── ...
     * ├── logs
     * ├── ...
     */
    workDir: string;
    isDev: boolean;
    jwtSecret: string;
    mongodbBiz: string;
    mongodbGridFs: string;
    routeDownload: string;
    port: number;
}

declare module "koa" {
    interface BaseContext {
        config: AppConfig;
        logger: log4js.Logger;
        loggerAccess: log4js.Logger;
    }
    interface DefaultState extends JwtState {}
}
