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

export function isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}
