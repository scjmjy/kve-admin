import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { DEPARTMENT_CONTAINER_ID, DeptTreeNodesResult } from "admin-common";
import { KoaAjaxContext } from "@/types/koa";
import { DepartmentModel } from "@/model/department";

export async function getDeptTreeNodes(ctx: KoaAjaxContext<void, DeptTreeNodesResult>) {
    const query = DepartmentModel.findById<DeptTreeNodesResult>(DEPARTMENT_CONTAINER_ID);
    query.setQuery({
        doPopulate: true,
    });
    const department = await query.exec();
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        data: department!,
    };
}
