import { FormItemRule, IBase, isValidPassword, ValidatorRules } from "./utils";
import { IDepartment, IRole } from "./department";

export type Gender = "MALE" | "FEMALE" | "UNKNOWN";

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

export const USER_SUPERADMIN_ID = "000000000000000000000001";

//#region UserProfile
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
//#endregion

export interface UpdateUserPassword {
    oldPassword: string;
    newPassword: string;
}

export interface UpdateUserAvatar {
    /** base64 字符串 */
    avatar: string;
}

//#region FindUser

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

export type UserFilter = Extract<keyof IUser, "username" | "realname" | "mobileno" | "email" | "status" | "depts">;
export type FindUsersParams = PaginationParams<UserFilter>;
export type FindUsersResult = PaginationResult<Pick<IUser, FindUserKeys>>;

//#endregion

//#region CreateUser UpdateUser
export interface CreateUserBody
    extends Pick<IUser, "username" | "realname" | "password">,
        Partial<Pick<IUser, "mobileno" | "email" | "gender">> {
    depts: string[];
    roles: string[];
}

export interface UpdateUserBody extends Omit<CreateUserBody, "password"> {
    _id: string;
    password?: string;
}

export type UserRules = ValidatorRules<CreateUserBody & UpdateUserBody>;

export function getUserRules(type: "create" | "update") {
    const userRules: UserRules = {
        _id: {
            required: true,
            len: 24,
            message: "请提供正确的用户 ID！",
        },
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
                required: false,
                validator(rule, value, callback) {
                    if (!value) {
                        return callback();
                    }
                    const validation = isValidPassword(value);
                    if (validation === "fail-range") {
                        callback(new Error("密码长度为 6 到 24 个字符！"));
                    } else if (validation === "fail-strong") {
                        callback(new Error("请包含数字、英文字母、特殊字符中的 2 种！"));
                    } else {
                        callback();
                    }
                },
                trigger: ["change"],
            },
        ],
        depts: {
            required: true,
            type: "array",
            min: 1,
            message: "所属部门不能为空！",
        },
        roles: {
            required: true,
            type: "array",
            min: 1,
            message: "拥有的角色不能为空！",
        },
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
    if (type === "create") {
        (userRules._id as FormItemRule).required = false;
    } else {
        (userRules.password as Array<FormItemRule>).shift();
    }
    return userRules;
}

//#endregion

//#region user status

export interface UserIdsBody {
    ids: string[];
}

//#endregion
