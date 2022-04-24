declare global {
    export type Projection<Doc> = (keyof Doc)[];

    export type Undefinable<T> = T | undefined;
    export type Nullable<T> = T | null;
    export type Arrayable<T> = T | T[];
    export type Awaitable<T> = Promise<T> | T;

    export type EnableStatus = "enabled" | "disabled" | "deleted";

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
        [key in T]: PaginationCondition;
    };

    export interface PaginationParams<T extends string> {
        filter?: Partial<PaginationFilter<T>>;
        pageNum: number;
        pageSize: number;
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

export function isValidStatus(status: string): status is EnableStatus {
    return ["enabled", "disabled", "deleted"].includes(status);
}

import { RuleItem } from "async-validator";

export interface FormItemRule extends RuleItem {
    trigger?: Arrayable<string>;
}
export type ValidatorRules<T> = {
    [P in keyof T]: Arrayable<FormItemRule>;
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
