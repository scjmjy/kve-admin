import { IBase, isValidPassword, ValidatorRules } from "./utils";
import { IDepartment, IRole } from "./department";

export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    UNKNOWN = "UNKNOWN",
}

export interface LoginCredential {
    username: string;
    password: string;
}

export interface LoginResult {
    token: string;
    id: string;
}

export interface IUser extends IBase {
    username: string;
    password: string;
    realname: string;
    email: string;
    mobileno: string;
    gender: Gender;
    avatar: string;
    thumbnail: string;
    depts: IDepartment[];
    roles: IRole[];
}

export const UserProfileProjection = [
    "_id",
    "username",
    "realname",
    "mobileno",
    "email",
    "gender",
    "depts",
    "roles",
    "createdAt",
    "updatedAt",
] as const;

type UserProfileKeys = typeof UserProfileProjection[number];

export interface UserProfileResult extends Pick<IUser, Exclude<UserProfileKeys, "depts" | "roles">> {
    depts: Pick<IDepartment, "_id" | "name">[];
    roles: Pick<IRole, "_id" | "name">[];
}

export type UpdateUserProfile = Pick<UserProfileResult, "realname" | "email" | "mobileno" | "gender">;

export interface UpdateUserPassword {
    oldPassword: string;
    newPassword: string;
}

export interface UpdateUserAvatar {
    /** base64 字符串 */
    avatar: string;
}

export type UserFilter = PaginationFilter<
    Pick<IUser, "username" | "realname" | "mobileno" | "email" | "status" | "depts">
>;


export const FindUserProjection = [
    "_id",
    "username",
    "realname",
    "mobileno",
    "email",
    "gender",
    "depts",
    "roles",
    "thumbnail",
    "status",
    "createdAt",
    "updatedAt",
] as const;

type FindUserKeys = typeof FindUserProjection[number];

export type FindUsersParams = PaginationParams<UserFilter>;
export type FindUsersResult = PaginationResult<Pick<IUser, FindUserKeys>>;

export type CreateUserBody = Pick<IUser, "username" | "realname" | "password"> &
    Partial<Pick<IUser, "mobileno" | "email" | "gender" | "depts" | "roles" | "avatar">>;

export type CreateUserRules = ValidatorRules<CreateUserBody>;

export const createUserRules: CreateUserRules = {
    username: [
        {
            required: true,
            message: "用户名不能为空！",
            trigger: ["change"],
        },
        {
            min: 6,
            max: 24,
            message: "用户名为 6-24 位字符！",
            trigger: ["change"],
        },
    ],
    realname: [
        {
            required: true,
            message: "真实姓名不能为空！",
            trigger: ["change"],
        },
        {
            min: 2,
            max: 24,
            message: "用户名为 2-24 个字符！",
            trigger: ["change"],
        },
    ],
    password: [
        { required: true, message: "密码不能为空", trigger: ["change"] },
        {
            validator(rule, value, callback) {
                const validation = isValidPassword(value);
                if (validation === "fail-range") {
                    callback(new Error("密码长度为 6 到 24 个字符！"));
                } else if (validation === "fail-strong") {
                    callback(new Error("密码必须同时包含数字，大、小字母，特殊字符中的 2 种！"));
                } else {
                    callback();
                }
            },
            trigger: ["change"],
        },
    ],
    gender: {
        required: true,
        message: "请选择性别！",
        trigger: ["change"],
    },
    email: {
        required: false,
        type: "email",
        message: "'请输入正确的邮箱地址",
        trigger: ["change"],
    },
    mobileno: {
        required: false,
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        message: "请输入正确的手机号码",
        trigger: ["change"],
    },
};
