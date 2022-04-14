import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { DEPARTMENT_CONTAINER_ID, DeptTreeNodesResult } from "admin-common";
import { KoaContext } from "@/types/koa";
import { DepartmentModel } from "@/model/department";

export async function getDeptTreeNodes(ctx: KoaContext<void, DeptTreeNodesResult>) {
    const department = await DepartmentModel.findById<DeptTreeNodesResult>(DEPARTMENT_CONTAINER_ID).exec();
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        data: department!,
    };
}
