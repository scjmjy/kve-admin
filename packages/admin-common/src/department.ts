import { IPermission } from "./permission";
import { FormItemRule, IBase, ValidatorRules } from "./utils";
export interface IRole extends IBase {
    name: string;
    perms: IPermission[];
    description: string;
}

export const ROLE_SUPERADMIN_ID = "000000000000000000000002";

export interface IDepartment extends IBase {
    name: string;
    roles: IRole[];
    depts: IDepartment[];
    description: string;
}

export const DEPARTMENT_CONTAINER_ID = "000000000000000000000003";

export interface DeptTreeNodesResult extends IDepartment {}

//#region create dept, update dept
interface CommonDeptBody extends Pick<IDepartment, "name" | "description"> {}
export interface CreateDeptBody extends Pick<IDepartment, "name" | "description"> {
    parent: string;
}
export interface UpdateDeptBody extends CommonDeptBody, Pick<IDepartment, "_id"> {}

export type CreateDeptRules = ValidatorRules<CreateDeptBody>;
export type UpdateDeptRules = ValidatorRules<UpdateDeptBody>;

function getCommonDeptRules(): ValidatorRules<CommonDeptBody> {
    return {
        name: {
            required: true,
            min: 2,
            max: 24,
            message: "用户名为 2-24 位字符！",
            trigger: ["change"],
        },
        description: {
            min: 0,
            max: 1024,
            message: "描述信息为 0-1024 位字符！",
            trigger: ["change"],
        },
    };
}

export function getCreateDeptRules(): CreateDeptRules {
    return {
        parent: {
            required: true,
            len: 24,
            message: "请提供父部门的 ID ！",
        },
        ...getCommonDeptRules(),
    };
}

export function getUpdateDeptRules(): UpdateDeptRules {
    return {
        _id: {
            required: true,
            len: 24,
            message: "请提供部门的 ID ！",
        },
        ...getCommonDeptRules(),
    };
}
//#endregion

//#region create role, update role

export interface CreateRoleBody extends Pick<IRole, "name" | "description"> {
    dept: string; // 所属部门
}

export interface UpdateRoleBody extends Omit<CreateRoleBody, "dept">, Pick<IRole, "_id"> {}

export interface UpdateRolePermsBody extends Pick<IRole, "_id"> {
    perms: string[];
}

export type CreateRoleRules = ValidatorRules<CreateRoleBody>;
export type UpdateRoleRules = ValidatorRules<UpdateRoleBody>;

export function getCreateRoleRules() {
    const roleRules: CreateRoleRules = {
        dept: {
            required: true,
            len: 24,
            message: "请提供所属部门的 ID ！",
        },
        name: [
            {
                required: true,
                message: "角色名称不能为空！",
                trigger: ["change"],
            },
            {
                min: 2,
                max: 24,
                message: "用户名为 2-24 位字符！",
                trigger: ["change"],
            },
        ],
        description: {
            min: 0,
            max: 1024,
            message: "描述信息为 0-1024 位字符！",
            trigger: ["change"],
        },
    };
    return roleRules;
}

export function getUpdateRoleRules() {
    const createRoles = getCreateRoleRules();
    (createRoles.dept as FormItemRule).required = false;
    const roleRules: UpdateRoleRules = {
        _id: {
            required: true,
            len: 24,
            message: "请提供正确的用户 ID！",
        },
        ...createRoles,
    };
    return roleRules;
}

//#endregion

//#region drag-drop reorder

export interface ReorderRolesBody {
    deptId: string;
    rolesIds: string[];
}

//#endregion
