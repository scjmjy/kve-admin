import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import {
    CreateResult,
    CreateMenuActionBody,
    CreateMenuGroupBody,
    CreateMenuItemBody,
    DragDropBody,
    EnableStatus,
    ExternalLinkEnum,
    getCreateActionRules,
    getCreateGroupRules,
    getCreateItemRules,
    getUpdateActionRules,
    getUpdateGroupRules,
    getUpdateItemRules,
    getStatusLabel,
    GetPermNodeQuery,
    isValidStatus,
    PermissionTypeEnum,
    PermNodeResult,
    UpdateMenuActionBody,
    UpdateMenuGroupBody,
    UpdateMenuItemBody,
} from "admin-common";
import { PermissionModel } from "@/model/permission";
import { Schema } from "@/utils/async-validator";
import { throwBadRequestError, throwNotFoundError } from "./errors";
import { permService } from "@/services";
import { dragDropDocs } from "./utils";

export const getPermNodes: RestAjaxMiddleware<void, PermNodeResult, any, GetPermNodeQuery> = async (ctx) => {
    const { status } = ctx.query;
    const res = await permService.getPermNodes(status);

    if (!res) {
        return throwNotFoundError("权限根节点不存在！");
    }
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        data: res,
    };
};

type PermDoc1 = mongoose.Document & { children: string[] };

type CreatePermBody = CreateMenuActionBody & CreateMenuGroupBody & CreateMenuItemBody;
type UpdatePermBody = UpdateMenuActionBody & UpdateMenuGroupBody & UpdateMenuItemBody;

export const postPermission: RestAjaxMiddleware<CreatePermBody, CreateResult> = async (ctx) => {
    const { type, component } = ctx.request.body || {};
    if (!PermissionTypeEnum.includes(type as any)) {
        return throwBadRequestError("无效的菜单类型：" + type);
    }
    const rules =
        type === "action"
            ? getCreateActionRules()
            : type === "menugroup"
            ? getCreateGroupRules()
            : getCreateItemRules(
                  component === ExternalLinkEnum.ExternalLink,
                  component === ExternalLinkEnum.ExternalLinkIframe,
              );
    const schema = new Schema(rules);
    const validBody = (await schema.validate(ctx.request.body || {}, { first: true })) as CreatePermBody;
    let parent: Nullable<PermDoc1>;
    if (validBody.parent) {
        parent = await PermissionModel.findById<PermDoc1>(validBody.parent, "children").exec();
        if (!parent) {
            return throwNotFoundError(`父菜单不存在：${validBody.parent}`);
        }
    }
    return mongoose
        .startSession()
        .then((session) =>
            session.withTransaction(async () => {
                const newDoc = (await PermissionModel.create([validBody], { session: session }))[0];
                if (parent) {
                    parent.children.push(newDoc._id);
                    await parent.save({ session: session });
                }
                ctx.status = StatusCodes.OK;
                ctx.body = {
                    code: ctx.status,
                    showType: "MESSAGE",
                    msg: "菜单创建成功！",
                    data: {
                        _id: newDoc._id,
                    },
                };
            }),
        )
        .catch((err) => {
            ctx.logger.debug.error("[postPermission]", err);
            ctx.status = StatusCodes.INTERNAL_SERVER_ERROR;
            ctx.body = {
                code: ctx.status,
                showType: "MESSAGE",
                msg: "菜单创建失败！",
            };
        });
}

export const putPermission: RestAjaxMiddleware<UpdatePermBody> = async (ctx) => {
    const { type, component } = ctx.request.body || {};
    if (!PermissionTypeEnum.includes(type as any)) {
        return throwBadRequestError("无效的菜单类型：" + type);
    }
    const rules =
        type === "action"
            ? getUpdateActionRules()
            : type === "menugroup"
            ? getUpdateGroupRules()
            : getUpdateItemRules(
                  component === ExternalLinkEnum.ExternalLink,
                  component === ExternalLinkEnum.ExternalLinkIframe,
              );
    const schema = new Schema(rules);
    const validBody = (await schema.validate(ctx.request.body || {}, { first: true })) as UpdatePermBody;
    const res = await PermissionModel.findByIdAndUpdate(validBody._id, validBody, {
        projection: "_id",
    }).exec();
    if (!res) {
        return throwNotFoundError("菜单不存在:" + validBody._id);
    }
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: "菜单更新成功！",
    };
}

export const putEnablePerm: RestAjaxMiddleware<void, void, { permId: string; status: EnableStatus }> = async (ctx) => {
    const { permId, status } = ctx.params;
    if (!permId || permId.length !== 24 || !isValidStatus(status)) {
        return throwBadRequestError("请提供有效的部门 ID 或 状态值！");
    }
    const res = await PermissionModel.findByIdAndUpdate(
        permId,
        {
            status: status,
        },
        {
            projection: "_id",
        },
    ).exec();
    if (!res) {
        return throwNotFoundError("菜单不存在:" + permId);
    }
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: getStatusLabel(status) + "菜单成功！",
    };
}
export const postDragDropPerms: RestAjaxMiddleware<DragDropBody, PermNodeResult | undefined> = async (ctx) => {
    const reqBody = ctx.request.body!;
    await dragDropDocs(reqBody, PermissionModel, "children");

    let data: PermNodeResult | undefined = undefined;
    if (reqBody.returnNew) {
        data = await permService.getPermNodes();
    }

    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: "菜单拖拽成功！",
        data,
    };
}
