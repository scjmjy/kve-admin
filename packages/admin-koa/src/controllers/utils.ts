import { ObjectId } from "bson";
import mongoose from "mongoose";
import "mongoose-paginate-v2";
import type { Request } from "koa";
import { getGridFsBucket } from "@/middlewares/upload";
import { throwBadRequestError } from "./errors";
import { File } from "@koa/multer";
import path from "path";

declare module "mongoose" {
    export interface ExtraQueryOptions {
        doPopulate?: boolean;
    }
    export interface QueryOptions<DocType = unknown> extends ExtraQueryOptions {}
}

export function makePaginationResult<T>(result: mongoose.PaginateResult<T>) {
    return {
        list: result.docs,
        total: result.totalDocs,
        pageNum: result.page!,
        pageSize: result.limit,
        pageTotal: result.totalPages,
        pageStart: result.pagingCounter,
        pagePre: result.prevPage!,
        pageNext: result.nextPage!,
        pageHasPre: result.hasPrevPage,
        pageHasNext: result.hasNextPage,
    };
}

/**
 *
 * @param Model Mongoose Mddel，例如 UserModel
 * @param params 前端传过来的过滤条件和页码参数
 * @param extraQuery ExtraQuery
 * @returns
 */
export async function handlePaginationRequest<T, FilterT extends string>(
    Model: mongoose.PaginateModel<T>,
    params?: PaginationParams<FilterT>,
    projection?: string,
    extraQuery?: Record<string, any>,
    extraQueryOpts?: mongoose.ExtraQueryOptions,
) {
    const { pageNum, pageSize, filter, sort } = params || {};
    if (!pageNum || !pageSize) {
        throwBadRequestError("请提供正确的参数！");
        return Promise.reject();
    }
    const options: mongoose.PaginateOptions = {
        page: pageNum,
        limit: pageSize,
        offset: (pageNum - 1) * pageSize,
        projection,
        sort,
        options: extraQueryOpts,
    };
    const queryBuilder = new QueryBuilder<PaginationParams<FilterT>["filter"]>(extraQuery);
    if (filter) {
        queryBuilder.addQuery(filter);
    }
    const res = await Model.paginate(queryBuilder.query, options);
    return makePaginationResult(res);
}

export class QueryBuilder<T> {
    constructor(public query: mongoose.FilterQuery<T> = {}) {}
    addQuery(query: mongoose.FilterQuery<T>) {
        let key: any;
        for (key in query) {
            const value = query[key];
            if (!value) {
                continue;
            }
            // type: "regex" | "eq" | "ne" | "gte" | "gt" | "lte" | "lt" | "in" | "nin";
            switch (value.comparison) {
                case "regex":
                    this.regexp(key, value.value);
                    break;
                case "eq":
                    this.equal(key, value.value);
                    break;
                case "ne":
                    this.notEqual(key, value.value);
                    break;
                case "gte":
                    this.gte(key, value.value);
                    break;
                case "gt":
                    this.gt(key, value.value);
                    break;
                case "lte":
                    this.lte(key, value.value);
                    break;
                case "lt":
                    this.lt(key, value.value);
                    break;
                case "range":
                    this.range(key, value.value);
                    break;
                case "in":
                    this.in(key, value.value);
                    break;
                case "nin":
                    this.notIn(key, value.value);
                    break;

                default:
                    break;
            }
        }
    }
    clearQuery() {
        this.query = {};
    }
    equal(prop: keyof T, keyword?: string | number) {
        if (keyword !== undefined && keyword !== null) {
            // @ts-ignore
            this.query[prop] = keyword;
        }
        return this;
    }
    notEqual(prop: keyof T, keyword?: string | number) {
        if (keyword !== undefined && keyword !== null) {
            // @ts-ignore
            this.query[prop] = {
                $ne: keyword,
            };
        }
        return this;
    }
    gte(prop: keyof T, keyword?: string | number) {
        if (keyword !== undefined && keyword !== null) {
            // @ts-ignore
            this.query[prop] = {
                $gte: keyword,
            };
        }
        return this;
    }
    gt(prop: keyof T, keyword?: string | number) {
        if (keyword !== undefined && keyword !== null) {
            // @ts-ignore
            this.query[prop] = {
                $gt: keyword,
            };
        }
        return this;
    }
    lte(prop: keyof T, keyword?: string | number) {
        if (keyword !== undefined && keyword !== null) {
            // @ts-ignore
            this.query[prop] = {
                $lte: keyword,
            };
        }
        return this;
    }
    lt(prop: keyof T, keyword?: string | number) {
        if (keyword !== undefined && keyword !== null) {
            // @ts-ignore
            this.query[prop] = {
                $lt: keyword,
            };
        }
        return this;
    }
    regexp(prop: keyof T, keyword?: string) {
        if (keyword) {
            // @ts-ignore
            this.query[prop] = new RegExp(keyword, "i");
        }
        return this;
    }
    range(prop: keyof T, range?: (string | number)[]) {
        if (range && range.length >= 2) {
            // @ts-ignore
            this.query[prop] = {
                $gte: range[0],
                $lte: range[1],
            };
        }
        return this;
    }
    in(prop: keyof T, range?: (string | number)[]) {
        if (range) {
            // @ts-ignore
            this.query[prop] = {
                $in: range,
            };
        }
        return this;
    }
    notIn(prop: keyof T, range?: (string | number)[]) {
        if (range) {
            // @ts-ignore
            this.query[prop] = {
                $nin: range,
            };
        }
        return this;
    }
}

/**
 * 用于处理 upload 中间件产生的 ctx.body
 *
 * 使用场景：
 * 1. 添加 Object.prototype 至 ctx.body
 * 2. 自动 parse 数组/对象字段
 * @param body ctx.body
 */
export function normalizeUploadBody(body: Record<string, any>) {
    if (!body) {
        return;
    }
    Object.setPrototypeOf(body, Object.prototype);
    for (const key in body) {
        const value = body[key];
        if (value === "undefined") {
            body[key] = undefined;
        } else if (value === "null") {
            body[key] = null;
        } else {
            try {
                body[key] = JSON.parse(value);
            } catch (err) {
                console.error("[normalizeUploadBody]", key);
            }
        }
    }
}

/**
 * 删除 upload 中间件产生的 GridFs 文件
 *
 * 使用场景：表单校验失败后，删除 MongoDb GridFs 文件
 */
export function deleteReqFiles(req: Request) {
    const { file, files } = req;
    const ids: ObjectId[] = [];
    if (file) {
        ids.push(file.id);
    }
    if (files) {
        if (Array.isArray(files)) {
            for (const file of files) {
                ids.push(file.id);
            }
        } else {
            const filesArr = Object.values(files);
            for (const files of filesArr) {
                for (const file of files) {
                    ids.push(file.id);
                }
            }
        }
    }
    const bucket = getGridFsBucket();
    const promoises: Promise<void>[] = [];
    for (const id of ids) {
        promoises.push(bucket.delete(id));
    }
    return promoises;
}

function makeGridFsFile(file: File) {
    const result: GridFsFile = {
        name: file.filename,
        url: file.id.toString(),
        size: file.size,
        mimetype: file.mimetype,
    };
    const ext = path.extname(file.filename);
    if (ext === ".7z") {
        result.mimetype = "application/x-7z-compressed";
    }
    return result;
}

export function mapReqFiles(req: Request, fieldname?: string) {
    const gridFsFiles: GridFsFile[] = [];
    const { file, files } = req;
    if (file) {
        gridFsFiles.push(makeGridFsFile(file));
    }
    if (Array.isArray(files)) {
        for (const file of files) {
            gridFsFiles.push(makeGridFsFile(file));
        }
    } else if (files) {
        for (const key in files) {
            if (fieldname && key !== fieldname) {
                continue;
            }
            for (const file of files[key]) {
                gridFsFiles.push(makeGridFsFile(file));
            }
        }
    }
    return gridFsFiles;
}
