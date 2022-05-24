import mongoose from "mongoose";
import { ObjectId } from "bson";
import { StatusCodes } from "http-status-codes";
import Schema from "async-validator";
import {
    CreateDemoCollectionBody,
    FindDemoCollectionParams,
    FindDemoCollectionProjection,
    FindDemoCollectionResult,
    getCreateDemoCollRules,
    getUpdateDemoCollRules,
    IDemoCollection,
    UpdateDemoCollectionBody,
} from "admin-common";
import { DemoCollectionModel } from "@/model/demo-collection";
import { KoaAjaxContext } from "@/types/koa";
import { throwBadRequestError, throwNotFoundError } from "./errors";
import { deleteReqFiles, handlePaginationRequest, mapReqFiles, normalizeUploadBody } from "./utils";
import { getGridFsBucket } from "@/middlewares/upload";

export async function postFindDemoCollection(
    ctx: KoaAjaxContext<Undefinable<FindDemoCollectionParams>, FindDemoCollectionResult>,
) {
    const params = ctx.request.body;
    if (!params || !params.pageNum || !params.pageSize) {
        return throwBadRequestError("分页参数错误！");
    }
    const res = await handlePaginationRequest(DemoCollectionModel, params, FindDemoCollectionProjection.join(" "), {
        status: "enabled",
    });
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        data: res,
    };
}

// export async function postDemoCollection_pre(ctx: KoaAjaxContext<CreateDemoCollectionBody, CreateResult>, next: Next) {
//     const schema = new Schema(getCreateDemoCollRules());
//     await schema.validate(ctx.request.body || {}, { first: true });
//     return next();
// }

export async function postDemoCollection(ctx: KoaAjaxContext<CreateDemoCollectionBody, CreateResult>) {
    const body = ctx.request.body!;
    normalizeUploadBody(body);
    const schema = new Schema(getCreateDemoCollRules());
    try {
        await schema.validate(body!, { first: true });
    } catch (error) {
        deleteReqFiles(ctx.request);
        throw error;
    }

    const gridFsFile = mapReqFiles(ctx.request, "gridFsFile");
    if (gridFsFile.length) {
        body.gridFsFile = gridFsFile[0];
    }
    body.gridFsFileList = mapReqFiles(ctx.request, "gridFsFileList");
    try {
        const newDoc = await DemoCollectionModel.create(body);
        ctx.status = StatusCodes.OK;
        ctx.body = {
            code: ctx.status,
            showType: "MESSAGE",
            msg: "DemoCollection 创建成功！",
            data: {
                _id: newDoc._id,
            },
        };
    } catch (error) {
        deleteReqFiles(ctx.request);
        throw error;
    }
    // console.log("[postDemoCollection] body", ctx.request.body);
    // console.log("[postDemoCollection] files", ctx.request.files);
}

export async function putDemoCollection(ctx: KoaAjaxContext<UpdateDemoCollectionBody, void>) {
    const body = ctx.request.body!;
    normalizeUploadBody(body);
    const schema = new Schema(getUpdateDemoCollRules());
    try {
        await schema.validate(body, { first: true });
    } catch (error) {
        deleteReqFiles(ctx.request);
        throw error;
    }
    const existingDoc = await DemoCollectionModel.findById(body._id);
    if (!existingDoc) {
        return throwNotFoundError("DemoCollection 不存在:" + body._id);
    }
    const bucket = getGridFsBucket();
    if (existingDoc.gridFsFile && !body.gridFsFile) {
        // 说明 gridFsFile 被删除了
        try {
            await bucket.delete(new ObjectId(existingDoc.gridFsFile.url));
        } catch (error) {
            ctx.logger.error("[putDemoCollection] gridFsFile delete", error);
        }
    }
    if (existingDoc.gridFsFile && body.gridFsFile) {
        // 因为 body.gridFsFile 中的 url 添加了 ctx.config.route_download 前缀，所以通过以下代码修复
        body.gridFsFile.url = existingDoc.gridFsFile.url;
    }
    const gridFsFile = mapReqFiles(ctx.request, "gridFsFile");
    if (gridFsFile.length) {
        body.gridFsFile = gridFsFile[0];
    }
    if (existingDoc.gridFsFileList!.length !== body.gridFsFileList!.length) {
        // 说明 gridFsFileList 有被删除的
        function toDeletePredicate(file: GridFsFile) {
            return !body.gridFsFileList!.find((item) => item.url.includes(file.url));
        }
        const toDeleteIds = existingDoc
            .gridFsFileList!.filter((file) => toDeletePredicate(file))
            .map((file) => file.url);
        try {
            for (const id of toDeleteIds) {
                await bucket.delete(new ObjectId(id));
            }
        } catch (error) {
            ctx.logger.error("[putDemoCollection] gridFsFileList delete", error);
        }
        // 因为 body.gridFsFileList 中的 url 添加了 ctx.config.route_download 前缀，所以通过以下代码修复
        body.gridFsFileList = existingDoc.gridFsFileList!.filter((file) => !toDeleteIds.includes(file.url));
    } else {
        // 因为 body.gridFsFileList 中的 url 添加了 ctx.config.route_download 前缀，所以通过以下代码修复
        body.gridFsFileList = existingDoc.gridFsFileList;
    }

    body.gridFsFileList!.push(...mapReqFiles(ctx.request, "gridFsFileList"));

    Object.assign(existingDoc, body);
    await existingDoc.save();

    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: "DemoCollection 更新成功！",
    };
}

export async function getDemoCollection(ctx: KoaAjaxContext<void, IDemoCollection, any, { demoCollId: string }>) {
    const { demoCollId } = ctx.params;
    const existingDoc = await DemoCollectionModel.findById(demoCollId).exec();
    if (!existingDoc) {
        return throwNotFoundError("DemoCollection 不存在:" + demoCollId);
    }
    const downloadPrefix = ctx.config.route_download;
    existingDoc.gridFsFileList!.forEach((file) => {
        file.url = downloadPrefix + file.url;
    });
    if (existingDoc.gridFsFile) {
        existingDoc.gridFsFile.url = downloadPrefix + existingDoc.gridFsFile.url;
    }
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "SILENT",
        msg: "获取 DemoCollection 详情成功！",
        data: existingDoc,
    };
}

export async function deleteDemoCollection(ctx: KoaAjaxContext<void, void, { demoCollId: string }>) {
    const { demoCollId } = ctx.params;
    const existingDoc = await DemoCollectionModel.findById<mongoose.Document & { status: EnableStatus }>(
        demoCollId,
        "status",
    ).exec();
    if (!existingDoc) {
        return throwNotFoundError("DemoCollection 不存在:" + demoCollId);
    }
    existingDoc.status = "deleted";
    await existingDoc.save();
    ctx.status = StatusCodes.OK;
    ctx.body = {
        code: ctx.status,
        showType: "MESSAGE",
        msg: "DemoCollection 删除成功！",
    };
}
