import Router from "koa-router";
import { PERM_CODES } from "admin-common";
import {
    getDeptTreeNodes,
    postRole,
    putRole,
    putEnableRole,
    postReorderDepts,
    postReorderRoles,
    putEnableDept,
    putDept,
    postDept,
    putRolePerms,
} from "@/controllers/department";
import { hasPerm } from "@/middlewares/permission";

export const deptRouter = new Router<any, any>({
    prefix: "/dept",
});

const hasPerm_usermanage = hasPerm(PERM_CODES.system_usermanage);

deptRouter
    .use(hasPerm_usermanage)
    .get("/tree", getDeptTreeNodes)
    .post("/", postDept)
    .put("/", putDept)
    .put("/status/:deptId/:status", putEnableDept)
    .post("/reorder", postReorderDepts);

export const roleRouter = new Router<any, any>({
    prefix: "/role",
});

roleRouter
    .post("/", postRole)
    .put("/", putRole)
    .put("/perm", putRolePerms)
    .put("/status/:roleId/:status", putEnableRole)
    .post("/reorder", postReorderRoles);
