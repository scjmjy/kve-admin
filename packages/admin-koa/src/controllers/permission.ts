import mongoose, { ClientSession } from "mongoose";
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
    PermissionTypeEnum,
    PermNodeResult,
    ExternalLinkEnum,
    isValidStatus,
    getStatusLabel,
    ReorderPermsBody,
    DragDropPermsBody,
    GetPermNodeQuery,
} from "admin-common";
import { PermissionModel } from "@/model/permission";
import { Schema } from "@/utils/async-validator";
import { throwBadRequestError, throwNotFoundError } from "./errors";
import { permService } from "@/services";

export async function getPermNodes(ctx: KoaAjaxContext<void, PermNodeResult, any, GetPermNodeQuery>) {
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

export async function putEnablePerm(ctx: KoaAjaxContext<void, void, { permId: string; status: EnableStatus }>) {
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

export async function postReorderPerms(ctx: KoaAjaxContext<ReorderPermsBody>) {
    const { permId, permIds } = ctx.request.body || {};
    if (!permId || !Array.isArray(permIds) || permIds.length === 0) {
        return throwBadRequestError("请提供有效的菜单 ID！");
    }
    const perm = await PermissionModel.findById<mongoose.Document & { children: mongoose.Types.ObjectId[] }>(
        permId,
        "children",
    ).exec();
    if (!perm) {
        return throwNotFoundError(`菜单不存在：${permId}`);
    }
    perm.children.sort((a, b) => {
        return permIds.findIndex((id) => a.equals(id)) - permIds.findIndex((id) => b.equals(id));
    });
    await perm.save();
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: "菜单排序成功！",
    };
}

export async function postDragDropPerms(ctx: KoaAjaxContext<DragDropPermsBody, PermNodeResult | undefined>) {
    const { draggingParentId, draggingId, dropParentId, dropId, type, returnNew } = ctx.request.body || {};
    if (!draggingParentId || !draggingId || !dropParentId || !dropId || !type) {
        return throwBadRequestError("参数格式错误！");
    }
    const dragDropIds = [draggingParentId, draggingId, dropParentId, dropId];
    const perms = await PermissionModel.find<mongoose.Document & { children: mongoose.Types.ObjectId[] }>(
        {
            _id: {
                $in: dragDropIds,
            },
        },
        "children",
    ).exec();

    const draggingParentPerm = perms.find((perm) => perm.id === draggingParentId);
    const draggingPerm = perms.find((perm) => perm.id === draggingId);
    const dropParentPerm = perms.find((perm) => perm.id === dropParentId);
    const dropPerm = perms.find((perm) => perm.id === dropId);

    if (!draggingParentPerm || !draggingPerm || !dropParentPerm || !dropPerm) {
        return throwNotFoundError("菜单未找到！");
    }

    const draggingIndex = draggingParentPerm.children.findIndex((child) => child.toString() === draggingId);
    const dropIndex = dropParentPerm.children.findIndex((child) => child.toString() === dropId);
    switch (type) {
        case "before":
            if (draggingParentId === dropParentId) {
                // 在同一层，执行排序
                if (dropIndex > draggingIndex) {
                    // 已经处在正确的顺序
                } else {
                    const draggingObjId = draggingParentPerm.children.splice(draggingIndex, 1)[0];
                    draggingParentPerm.children.splice(dropIndex, 0, draggingObjId);
                }
                await draggingParentPerm.save();
            } else {
                // 不在同一层
                const draggingObjId = draggingParentPerm.children.splice(draggingIndex, 1)[0];
                dropParentPerm.children.splice(dropIndex, 0, draggingObjId);
                const session = await mongoose.startSession();
                await session.withTransaction(async () => {
                    await draggingParentPerm.save({ session: session });
                    await dropParentPerm.save({ session: session });
                });
            }
            break;

        case "after":
            if (draggingParentId === dropParentId) {
                // 在同一层，执行排序
                if (draggingIndex > dropIndex) {
                    // 已经处在正确的顺序
                } else {
                    const draggingObjId = draggingParentPerm.children.splice(draggingIndex, 1)[0];
                    draggingParentPerm.children.splice(dropIndex, 0, draggingObjId);
                }
                await draggingParentPerm.save();
            } else {
                // 不在同一层
                const draggingObjId = draggingParentPerm.children.splice(draggingIndex, 1)[0];
                dropParentPerm.children.splice(dropIndex + 1, 0, draggingObjId);
                const session = await mongoose.startSession();
                await session.withTransaction(async () => {
                    await draggingParentPerm.save({ session: session });
                    await dropParentPerm.save({ session: session });
                });
            }
            break;
        case "inner":
            const draggingObjId = draggingParentPerm.children.splice(draggingIndex, 1)[0];
            dropPerm.children.push(draggingObjId);
            const session = await mongoose.startSession();
            await session.withTransaction(async () => {
                await draggingParentPerm.save({ session: session });
                await dropPerm.save({ session: session });
            });
            break;
        default:
            return throwBadRequestError("拖拽类型错误错误: " + type);
    }

    let data: PermNodeResult | undefined = undefined;
    if (returnNew) {
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
