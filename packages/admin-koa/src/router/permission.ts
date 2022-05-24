import Router from "koa-router";
import { getPermNodes, postPermission, putEnablePerm, putPermission, postReorderPerms } from "@/controllers/permission";

export const permRouter = new Router<any, any>({
    prefix: "/perm",
});

permRouter
    .get("/tree", getPermNodes)
    .post("/", postPermission)
    .put("/", putPermission)
    .put("/status/:permId/:status", putEnablePerm)
    .post("/reorder", postReorderPerms);
