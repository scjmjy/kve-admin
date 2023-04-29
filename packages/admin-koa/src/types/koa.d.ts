import type { DefaultState, DefaultContext, Request, BaseContext, ParameterizedContext } from "koa";
import "koa__multer";
import type { Middleware } from "@types/koa__router";
import type { Redis } from "ioredis";
import type { AjaxResult } from "admin-common";
import type { ParsedUrlQuery } from "querystring";
import type { Logger } from "log4js";
import type { AppConfig } from "@/utils/config";

declare module "koa" {
    interface DefaultContext {
        config: AppConfig;
        logger: {
            /** 调试目的，例如服务器启动日志、各种调试信息 */
            debug: Logger;
            /** 访问日志，记录登录信息 */
            access: Logger;
            /** 操作日志，记录 CRUD 等操作信息 */
            operation: Logger;
        };
        redisClient: Redis;
        perms?: string[];
    }
    interface DefaultState extends JwtState {}
}

declare global {
    /**
     * token 中加密的数据
     */
    interface JwtPayload {
        userId: string;
    }

    /**
     * token 解码后，通过 ctx.state.user 获取其内容
     */
    interface JwtState {
        user: JwtPayload;
    }

    // interface MyBaseContext {
    //     config: AppConfig;
    //     logger: {
    //         /** 调试目的，例如服务器启动日志、各种调试信息 */
    //         debug: Logger;
    //         /** 访问日志，记录登录信息 */
    //         access: Logger;
    //         /** 操作日志，记录 CRUD 等操作信息 */
    //         operation: Logger;
    //     };
    //     redisClient: Redis;
    //     perms?: string[];
    // }

    interface KoaRequest<RequestBodyT> extends Request {
        body?: RequestBodyT;
    }

    interface KoaContext<
        RequestBodyT = any,
        ParamsT extends Record<string, string> = Record<string, string>,
        QueryT extends ParsedUrlQuery = ParsedUrlQuery,
    > extends DefaultContext {
        request: KoaRequest<RequestBodyT>;
        params: ParamsT;
        query: QueryT;
    }

    type RestAjaxMiddleware<
        RequestBodyT = any,
        ResponseDataT = any,
        ParamsT extends Record<string, string> = Record<string, string>,
        QueryT extends ParsedUrlQuery = ParsedUrlQuery,
        ResponseErrDataT = any,
    > = Middleware<
        DefaultState,
        KoaContext<RequestBodyT, ParamsT, QueryT>,
        AjaxResult<ResponseDataT, ResponseErrDataT>
    >;

    type RestMiddleware<
        RequestBodyT = any,
        ResponseBodyT = any,
        ParamsT extends Record<string, string> = Record<string, string>,
        QueryT extends ParsedUrlQuery = ParsedUrlQuery,
    > = Middleware<DefaultState, KoaContext<RequestBodyT, ParamsT, QueryT>, ResponseBodyT>;

    interface KoaAjaxContext<
        RequestBodyT = any,
        ResponseDataT = any,
        ParamsT extends Record<string, string> = Record<string, string>,
        QueryT extends ParsedUrlQuery = ParsedUrlQuery,
        ResponseErrDataT = any,
    > extends KoaContext<RequestBodyT, ParamsT, QueryT> {
        body: AjaxResult<ResponseDataT, ResponseErrDataT>;
    }

    interface KoaBodyContext<
        RequestBodyT = any,
        ResponseBodyT = any,
        ParamsT extends Record<string, string> = Record<string, string>,
        QueryT extends ParsedUrlQuery = ParsedUrlQuery,
    > extends KoaContext<RequestBodyT, ParamsT, QueryT> {
        body: ResponseBodyT;
    }
}

// interface AppConfig {
//     /** 是否是开发环境，即 NODE_ENV=development */
//     isDev: boolean;
//     /** koa 服务器监听端口 */
//     port: number;
//     /** 用于 session cookie 签名； 参考 @/middlewares/session.ts */
//     keys: string[];
//     /**
//      * 工作目录，**不用手动设置**
//      * workDir
//      * ├── js/
//      * │   ├── index.js
//      * │   ├── ...
//      * ├── public/
//      * │   ├── static/
//      * │   ├── assets/
//      * │   ├── favicon.ico
//      * │   ├── index.html
//      * │   ├── ...
//      * ├── logs
//      * ├── ...
//      */
//     workDir: string;
//     /** 用于 JWT 签名 */
//     jwtSecret: string;
//     /** 业务数据库 Connection String */
//     mongodbBiz: string;
//     /** GridFS 文件数据库 Connection String */
//     mongodbGridFS: string;
//     /** GridFS 文件下载接口前缀 */
//     routeDownload: string;
//     /** redis 连接配置 */
//     redis: {
//         host: string;
//         port: number;
//         username?: string;
//         password?: string;
//         db?: number;
//     };
// }

export {};
