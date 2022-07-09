import Router from "koa-router";
import { PERM_CODES } from "admin-common";
import { StatusCodes } from "http-status-codes";
import { hasPerm } from "@/middlewares/permission";

export const demoPermRouter = new Router<any, any>({
    prefix: "/demo-permission",
});

const hasPerm_group = hasPerm(PERM_CODES.demoPerm_group);
const hasPerm_group_action1 = hasPerm(PERM_CODES.demoPerm_group_action1);
const hasPerm_group_action2 = hasPerm(PERM_CODES.demoPerm_group_action2);
demoPermRouter
    .use(hasPerm_group)
    .get("/action1", hasPerm_group_action1, function (ctx: KoaAjaxContext) {
        ctx.status = StatusCodes.OK;
        ctx.body = {
            code: ctx.status,
            showType: "MESSAGE",
            msg: "操作成功 —— action1",
        };
    })
    .get("/action2", hasPerm_group_action2, function (ctx: KoaAjaxContext) {
        ctx.status = StatusCodes.OK;
        ctx.body = {
            code: ctx.status,
            showType: "MESSAGE",
            msg: "操作成功 —— action2",
        };
    });
