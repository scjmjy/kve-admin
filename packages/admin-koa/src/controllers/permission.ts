import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import {
    CreateMenuActionBody,
    CreateMenuGroupBody,
    CreateMenuItemBody,
    UpdateMenuActionBody,
    UpdateMenuGroupBody,
    UpdateMenuItemBody,
    getCreateActionRules,
    getCreateGroupRules,
    getCreateItemRules,
    getUpdateActionRules,
    getUpdateGroupRules,
    getUpdateItemRules,
    IPermission,
    PermissionTypeEnum,
    PERMISSION_CONTAINER_ID,
    PermNodeResult,
    ExternalLinkEnum,
} from "admin-common";
import { KoaAjaxContext } from "@/types/koa";
import { PermissionModel } from "@/model/permission";
import Schema from "async-validator";
import { throwBadRequestError, throwNotFoundError } from "./errors";

export async function getPermNodes(ctx: KoaAjaxContext<void, PermNodeResult>) {
    const query = PermissionModel.findById<IPermission>(PERMISSION_CONTAINER_ID);
    query.setQuery({
        doPopulate: true,
    });
    const res = await query.exec();
    if (!res) {
        return throwNotFoundError("权限根节点不存在！");
    }
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        data: res,
    };
}

type PermDoc1 = mongoose.Document & { children: string[] };

type CreatePermBody = CreateMenuActionBody & CreateMenuGroupBody & CreateMenuItemBody;
type UpdatePermBody = UpdateMenuActionBody & UpdateMenuGroupBody & UpdateMenuItemBody;

export async function postPermission(ctx: KoaAjaxContext<CreatePermBody, CreateResult>) {
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
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
        const newDoc = await PermissionModel.create(validBody);
        if (parent) {
            parent.children.push(newDoc._id);
            await parent.save();
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
    });
    await session.endSession();
}

export async function putPermission(ctx: KoaAjaxContext<UpdatePermBody, void>) {
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
