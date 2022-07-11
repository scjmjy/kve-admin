import Router from "koa-router";
import { PERM_CODES } from "admin-common";
import {
    getPermNodes,
    postPermission,
    putEnablePerm,
    putPermission,
    postDragDropPerms,
} from "@/controllers/permission";
import { hasPerm } from "@/middlewares/permission";

export const permRouter = new Router<any, any>({
    prefix: "/perm",
});

const hasPerm_menumanage = hasPerm(PERM_CODES.system_menumanage);
permRouter
    .use(hasPerm_menumanage)
    .get("/tree", getPermNodes)
    .post("/", postPermission)
    .put("/", putPermission)
    .put("/status/:permId/:status", putEnablePerm)
    .post("/drag-drop", postDragDropPerms);
