import type { ObjectId } from "bson";
import type { DefaultState, Request } from "koa";
import type { RouterContext } from "koa-router";
import type { Redis } from "ioredis";
import type { AjaxResult } from "admin-common";
import type { ParsedUrlQuery } from "querystring";
import type log4js from "log4js";

/**
 * token 中加密的数据
 */
export interface JwtPayload {
    userId: string;
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

interface IRouterContext<ParamsT extends Record<string, string>, QueryT extends ParsedUrlQuery>
    extends RouterContext<DefaultState> {
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
    /** 是否是开发环境，即 NODE_ENV=development */
    isDev: boolean;
    /** koa 服务器监听端口 */
    port: number;
    /** 用于 session cookie 签名； 参考 @/middlewares/session.ts */
    keys: string[];
    /**
     * 工作目录，**不用手动设置**
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
    /** 用于 JWT 签名 */
    jwtSecret: string;
    /** 业务数据库 Connection String */
    mongodbBiz: string;
    /** GridFS 文件数据库 Connection String */
    mongodbGridFS: string;
    /** GridFS 文件下载接口前缀 */
    routeDownload: string;
    /** redis 连接配置 */
    redis: {
        host: string;
        port: number;
        username?: string;
        password?: string;
        db?: number;
    };
}

declare module "koa" {
    interface BaseContext {
        config: AppConfig;
        logger: log4js.Logger;
        loggerAccess: log4js.Logger;
        redisClient: Redis;
        perms?: string[];
    }
    interface DefaultState extends JwtState {}
}
