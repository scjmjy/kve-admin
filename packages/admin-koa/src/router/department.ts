import Router from "koa-router";
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

export const deptRouter = new Router<any, any>({
    prefix: "/dept",
});

deptRouter
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
