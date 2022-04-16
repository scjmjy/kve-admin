import mongoose from "mongoose";
import { throwBadRequestError } from "./errors";

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
 * @param extraFilter 用于控制 populate 的参数，例如 PopulateQuery
 * @returns
 */
export async function handlePaginationRequest<T>(
    Model: mongoose.PaginateModel<T>,
    params?: PaginationParams<T>,
    projection?: string,
    extraFilter?: Record<string, any>,
) {
    const { filter, pageNum, pageSize } = params || {};
    if (!filter || !pageNum || !pageSize) {
        throwBadRequestError("请提供正确的参数！");
        return Promise.reject();
    }
    const options: mongoose.PaginateOptions = {
        page: pageNum,
        limit: pageSize,
        offset: (pageNum - 1) * pageSize,
        projection,
    };
    const queryBuilder = new QueryBuilder<PaginationParams<T>["filter"]>(extraFilter);
    for (const key in filter) {
        const value = filter[key];
        if (!value) {
            continue;
        }
        // type: "regex" | "eq" | "ne" | "gte" | "gt" | "lte" | "lt" | "in" | "nin";
        switch (value.comparison) {
            case "regex":
                queryBuilder.regexp(key, value.value);
                break;
            case "eq":
                queryBuilder.equal(key, value.value);
                break;
            case "range":
                queryBuilder.range(key, value.value);
                break;
            case "in":
                queryBuilder.in(key, value.value);
                break;
            case "nin":
                queryBuilder.nin(key, value.value);
                break;

            default:
                break;
        }
    }
    const res = await Model.paginate(queryBuilder.query, options);
    return makePaginationResult(res);
}

export class QueryBuilder<T> {
    constructor(public query: mongoose.FilterQuery<T> = {}) {}
    equal(prop: keyof T, keyword?: string | number) {
        if (keyword !== undefined && keyword !== null) {
            // @ts-ignore
            this.query[prop] = keyword;
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
    nin(prop: keyof T, range?: (string | number)[]) {
        if (range) {
            // @ts-ignore
            this.query[prop] = {
                $nin: range,
            };
        }
        return this;
    }
}
