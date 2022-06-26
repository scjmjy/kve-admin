declare global {
    export type Projection<Doc> = (keyof Doc)[];

    export type Undefinable<T> = T | undefined;
    export type Nullable<T> = T | null;
    export type Arrayable<T> = T | T[];
    export type Awaitable<T> = Promise<T> | T;

    export type EnableStatus = typeof StatusEnum[number];

    export interface GridFsFile {
        /** 文件名称 */
        name: string;
        /**
         * 可以直接访问的地址，有以下 2 种类型：
         *
         * 1. /api/download/:objId
         * 2. 当内联时，url 为 base64 格式的数据：data:xxx/xxx;base64,....
         */
        url: string;
        size: number;
        mimetype: string;
    }

    export interface CreateResult {
        _id: string;
    }

    export type PaginationCondition = PaginationCondition1 | PaginationCondition2 | PaginationCondition3;

    export interface PaginationCondition1 {
        comparison: "eq" | "ne" | "gte" | "gt" | "lte" | "lt";
        value: string | number;
    }
    export interface PaginationCondition2 {
        comparison: "range" | "in" | "nin";
        value: string[] | number[];
    }
    export interface PaginationCondition3 {
        comparison: "regex";
        value: string;
    }

    export type PaginationFilter<T extends string> = {
        [field in T]: PaginationCondition;
    };

    export type PaginationSort<T extends string> = {
        [field in T]: "ascending" | "descending";
    };
    export interface PaginationParams<T extends string> {
        pageNum: number;
        pageSize: number;
        filter?: PaginationFilter<T>;
        sort?: PaginationSort<T>;
    }

    export interface PaginationResult<T> {
        list: T[];
        total: number;
        pageNum: number;
        pageSize: number;
        pageTotal: number;
        pageStart: number;
        pagePre: number;
        pageNext: number;
        pageHasPre: boolean;
        pageHasNext: boolean;
    }
}
export const StatusEnum = ["enabled", "disabled", "deleted"] as const;

export function getStatusLabel(status: EnableStatus) {
    switch (status) {
        case "enabled":
            return "启用";
        case "disabled":
            return "禁用";
        case "deleted":
            return "删除";
        default:
            return "";
    }
}

export function isValidStatus(status: string): status is EnableStatus {
    return StatusEnum.includes(status as any);
}

import { RuleItem } from "async-validator";

export interface FormItemRule extends RuleItem {
    trigger?: Arrayable<string>;
}
export type ValidatorRules<T> = {
    [P in keyof T]: Arrayable<FormItemRule>;
};

export type ValidatorRulesS<T extends string> = {
    [P in T]: Arrayable<FormItemRule>;
};

export interface IBase {
    _id: string;
    createdAt: string;
    updatedAt: string;
    status: EnableStatus;
}

export type PasswordStrong = 1 | 2 | 3 | 4;
export interface PasswordValidationOption {
    min: number;
    max: number;
    strong: PasswordStrong;
    distinguishLowercaseAndUppercase: boolean;
}

export function isValidPassword(password: string, option?: PasswordValidationOption) {
    const validationOption = Object.assign(
        {
            min: 6,
            max: 24,
            strong: 2,
            distinguishLowercaseAndUppercase: true,
        },
        option,
    );

    if (!password || password.length < validationOption.min || password.length > validationOption.max) {
        return "fail-range";
    }

    let count = 0; // 满足的规则数量
    const digital = /[0-9]/; // 数字正则
    const uppercase = /[A-Z]/; // 大写字母正则
    const lowercase = /[a-z]/; // 小写字母正则
    const spec = /[,.<>{}~!@#$%^&*_]/; // 特殊字符正则

    // 判断密码是否包含数字
    if (digital.test(password)) {
        count++;
    }

    //判断密码是否包小写字母
    const isLowercase = lowercase.test(password);
    //判断密码是否包大写字母
    const isUppercase = uppercase.test(password);

    if (validationOption.distinguishLowercaseAndUppercase) {
        // 区分大小写
        isLowercase && count++;
        isUppercase && count++;
    } else {
        // 不区分大小写
        (isLowercase || isUppercase) && count++;
    }

    // 判断密码是否包含特殊字符
    if (spec.test(password)) {
        count++;
    }
    return count >= validationOption.strong ? "valid" : "fail-strong";
}

export function isBase64(str: string) {
    return !!str.match(/^data:(.*);base64,/);
}

export function getBase64Type(str: string) {
    const match = str.match(/^data:(.*);base64,/);
    if (!match) {
        return "";
    }
    return match[1];
}

export function splitBase64(base64: string) {
    if (base64 === undefined || base64 === null) {
        return;
    }
    const commaIndex = base64.indexOf(",");
    if (commaIndex === -1) {
        return;
    }
    const meta = base64.substring(0, commaIndex);
    const mimeMatch = meta.match(/:(.*);/);
    if (!mimeMatch) {
        return;
    }
    const data = base64.substring(commaIndex + 1);

    return {
        type: mimeMatch[1],
        data,
    };
}

export function makeBase64(type: string, data: string) {
    return `data:${type};base64,${data}`;
}
