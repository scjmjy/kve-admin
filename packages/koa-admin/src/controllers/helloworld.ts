import { StatusCodes } from 'http-status-codes';
import type { KoaContext } from "@/types/koa";
import type { HelloworldResult } from '@common/helloworld';

export function getHelloworld(ctx: KoaContext<any, HelloworldResult>) {
    ctx.type = "json";
    ctx.body = {
        code: StatusCodes.OK,
        msg: "Hello World ...",
    };
}
