import { DeptService } from "@/services/department";
import { PermService } from "@/services/permission";
import { UserService } from "@/services/user";
import type koa from "koa";

export let userService: UserService;
export let permService: PermService;
export let deptService: DeptService;

export function setupServices(app: koa) {
    const client = app.context.redisClient;
    userService = new UserService(client);
    permService = new PermService(client);
    deptService = new DeptService(client);
}
