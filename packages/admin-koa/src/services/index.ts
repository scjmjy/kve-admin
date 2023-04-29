import type koa from "koa";
import { UserService } from "@/services/user";
import { PermService } from "@/services/permission";
import { DeptService } from "@/services/department";

export let userService: UserService;
export let permService: PermService;
export let deptService: DeptService;

export function setupServices(app: koa) {
    const client = app.context.redisClient;
    userService = new UserService(client);
    permService = new PermService(client);
    deptService = new DeptService(client);
}
