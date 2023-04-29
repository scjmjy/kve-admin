import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import {
    CreateDeptBody,
    CreateResult,
    CreateRoleBody,
    DragDropBody,
    DeptTreeNodesResult,
    EnableStatus,
    getUpdateDeptRules,
    getStatusLabel,
    getCreateRoleRules,
    getUpdateRoleRules,
    ReorderRolesBody,
    getCreateDeptRules,
    isValidStatus,
    UpdateDeptBody,
    UpdateRoleBody,
    UpdateRolePermsBody,
} from "admin-common";
import { DepartmentModel, RoleModel } from "@/model/department";
import { Schema } from "@/utils/async-validator";
import { throwBadRequestError, throwNotFoundError } from "./errors";
import { deptService } from "@/services";
import { dragDropDocs } from "./utils";

export const getDeptTreeNodes: RestAjaxMiddleware<void, DeptTreeNodesResult> = async (ctx) => {
    const department = await deptService.getDeptNodes();
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        data: department!,
    };
}

export const postDept: RestAjaxMiddleware<CreateDeptBody, CreateResult> = async (ctx) => {
    const schema = new Schema(getCreateDeptRules());
    const validBody = (await schema.validate(ctx.request.body || {}, { first: true })) as CreateDeptBody;
    const parent = await DepartmentModel.findById<mongoose.Document & { depts: string[] }>(
        validBody.parent,
        "depts",
    ).exec();
    if (!parent) {
        return throwNotFoundError(`父部门不存在：${validBody.parent}`);
    }
    return mongoose
        .startSession()
        .then((session) =>
            session.withTransaction(async () => {
                const newDept = (await DepartmentModel.create([validBody], { session: session }))[0];
                parent.depts.push(newDept._id);
                await parent.save({ session: session });

                ctx.status = StatusCodes.OK;
                ctx.body = {
                    code: ctx.status,
                    showType: "MESSAGE",
                    msg: "部门创建成功！",
                    data: {
                        _id: newDept._id,
                    },
                };
            }),
        )
        .catch((err) => {
            ctx.logger.debug.error("[postDept]", err);
            ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
            ctx.body = {
                code: ctx.status,
                showType: "MESSAGE",
                msg: "部门创建失败！",
            };
        });
}

export const putDept: RestAjaxMiddleware<UpdateDeptBody> = async (ctx) => {
    const schema = new Schema(getUpdateDeptRules());
    const validBody = (await schema.validate(ctx.request.body || {}, { first: true })) as UpdateRoleBody;
    const res = await DepartmentModel.findByIdAndUpdate(validBody._id, validBody, {
        projection: "_id",
    }).exec();
    if (!res) {
        return throwNotFoundError("部门不存在:" + validBody._id);
    }
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: "部门更新成功！",
    };
}

export const putEnableDept: RestAjaxMiddleware<void, void, { deptId: string; status: EnableStatus }> = async (ctx) => {
    const { deptId, status } = ctx.params;
    if (!deptId || deptId.length !== 24 || !isValidStatus(status)) {
        return throwBadRequestError("请提供有效的部门 ID 或 状态值！");
    }
    const res = await DepartmentModel.findByIdAndUpdate(
        deptId,
        {
            status: status,
        },
        {
            projection: "_id",
        },
    ).exec();
    if (!res) {
        return throwNotFoundError("部门不存在:" + deptId);
    }
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: getStatusLabel(status) + "部门成功！",
    };
}

export const postRole: RestAjaxMiddleware<CreateRoleBody, CreateResult> = async (ctx) => {
    const schema = new Schema(getCreateRoleRules());
    const validBody = (await schema.validate(ctx.request.body || {}, { first: true })) as CreateRoleBody;
    const dept = await DepartmentModel.findById<mongoose.Document & { roles: string[] }>(
        validBody.dept,
        "roles",
    ).exec();
    if (!dept) {
        return throwNotFoundError(`部门不存在：${validBody.dept}`);
    }
    return mongoose
        .startSession()
        .then((session) =>
            session.withTransaction(async () => {
                const newRole = (await RoleModel.create([validBody], { session: session }))[0];

                dept.roles.push(newRole._id);
                await dept.save({ session: session });

                ctx.status = StatusCodes.OK;
                ctx.body = {
                    code: ctx.status,
                    showType: "MESSAGE",
                    msg: "角色创建成功！",
                    data: {
                        _id: newRole._id,
                    },
                };
            }),
        )
        .catch((err) => {
            ctx.logger.debug.error("[postRole]", err);
            ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
            ctx.body = {
                code: ctx.status,
                showType: "MESSAGE",
                msg: "角色创建失败！",
            };
        });
}

export const putRole: RestAjaxMiddleware<UpdateRoleBody> = async (ctx) => {
    const schema = new Schema(getUpdateRoleRules());
    const validBody = (await schema.validate(ctx.request.body || {}, { first: true })) as UpdateRoleBody;
    const res = await RoleModel.findByIdAndUpdate(validBody._id, validBody, {
        projection: "_id",
    }).exec();
    if (!res) {
        return throwNotFoundError("角色不存在:" + validBody._id);
    }
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: "角色更新成功！",
    };
}

export const putEnableRole: RestAjaxMiddleware<void, void, { roleId: string; status: EnableStatus }> = async (ctx) => {
    const { roleId, status } = ctx.params;
    if (!roleId || roleId.length !== 24 || !isValidStatus(status)) {
        return throwBadRequestError("请提供有效的角色 ID 或 状态值！");
    }
    const res = await RoleModel.findByIdAndUpdate(
        roleId,
        {
            status: status,
        },
        {
            projection: "_id",
        },
    ).exec();
    if (!res) {
        return throwNotFoundError("角色不存在:" + roleId);
    }
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: getStatusLabel(status) + "角色成功！",
    };
}

export const postDragDropDepts: RestAjaxMiddleware<DragDropBody, DeptTreeNodesResult | undefined> = async (ctx) => {
    const reqBody = ctx.request.body!;
    await dragDropDocs(reqBody, DepartmentModel, "depts");

    let department: DeptTreeNodesResult | undefined = undefined;
    if (reqBody.returnNew) {
        department = await deptService.getDeptNodes();
    }

    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: "部门拖拽成功！",
        data: department,
    };
}

export const postReorderRoles: RestAjaxMiddleware<ReorderRolesBody> = async (ctx) => {
    const { deptId, rolesIds } = ctx.request.body || {};
    if (!deptId || !Array.isArray(rolesIds) || rolesIds.length === 0) {
        return throwBadRequestError("请提供有效的部门 ID 或 角色 ID！");
    }
    const dept = await DepartmentModel.findById<mongoose.Document & { roles: mongoose.Types.ObjectId[] }>(
        deptId,
        "roles",
    ).exec();
    if (!dept) {
        return throwNotFoundError(`部门不存在：${deptId}`);
    }
    dept.roles.sort((a, b) => {
        return rolesIds.findIndex((id) => a.equals(id)) - rolesIds.findIndex((id) => b.equals(id));
    });
    await dept.save();
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: "角色排序成功！",
    };
}

export const putRolePerms: RestAjaxMiddleware<UpdateRolePermsBody> = async (ctx) => {
    const { _id, perms } = ctx.request.body || {};
    if (!_id || !Array.isArray(perms)) {
        return throwBadRequestError("请提供角色 ID 或 权限 ID 列表！");
    }
    const res = await RoleModel.findByIdAndUpdate(
        _id,
        {
            perms,
        },
        {
            projection: "_id",
        },
    ).exec();
    if (!res) {
        return throwNotFoundError("角色不存在:" + _id);
    }
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: "角色权限更新成功！",
    };
}
