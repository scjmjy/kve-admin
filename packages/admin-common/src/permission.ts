import { pick } from "lodash-unified";
import { IBase, ValidatorRules } from "./utils";

export interface IRouteMeta {
    /**
     * 在 AppMenu 和 TabList 中显示的名称
     */
    title?: string;
    /**
     * 此参数只在 visible=true 时有意义
     *
     * 在 AppMenu 中 title 前面显示的图标
     */
    icon?: string;
    /**
     * true: 固定在 TabList 最开头
     *
     * @default false
     */
    pinned?: boolean; // true: 默认为 false
    /**
     * true: 可以被 keep-alive 缓存，此时 route.name 和 VueComponent.name 必须保持一致
     *
     * false: 不被缓存，此时 route.name 和 VueComponent.name 的值就没有多大意义了。
     *
     * @default true
     */
    cacheable?: boolean;
    /**
     * true: 在 AppMenu 中显示
     *
     * false: 不在 AppMenu 中显示
     *
     * @default true
     */
    visible?: boolean;
    /**
     * 此参数只在 visible=false 时有意义
     *
     * 当此页面被激活后，高亮 AppMenu 里名为 ${forName} 的 Route
     *
     * 使用场景：适用于详情页，本身不在 AppMenu 中，所以当激活时，高亮对应的列表页面
     */
    forName?: string;
    /**
     * 此参数只在 cacheable=true 时有意义
     *
     * fullPath:
     * 1. 使用 route.fullPath 来区分是否是同一个页面
     * 2. /user/detail?id=1 和 /user/detail?id=2 会被认为 ***不同*** 的页面，可以同时存在
     * 3. 使用场景：同时存在多个详情页
     *
     * path:
     * 1. 使用 route.path 来区分
     * 2. /user/detail?id=1 和 /user/detail?id=2 会被认为 ***相同*** 的页面，只会存在一个
     * 3. 使用场景：同时只存在一个详情页
     *
     * @default "path"
     */
    pathKey?: "path" | "fullPath";
    /**
     * 内嵌网页，此时 cacheable 参数会被忽略
     *
     * iframe="http://xxxxx" 或 "https://xxxxx"： 嵌入到 iframe 中显示外部网页
     *
     * @default undefined
     */
    iframe?: string;
    /**
     * 是否显示页脚
     *
     * @default true
     */
    footer?: boolean;
}

/** IPermission.component 的特殊值，表示外链或内嵌外链 */
export enum ExternalLinkEnum {
    ExternalLink = "ExternalLink",
    ExternalLinkIframe = "ExternalLinkIframe",
}

export const PermissionTypeEnum = ["menugroup", "menuitem", "action"] as const;
export type PermissionType = typeof PermissionTypeEnum[number];

export interface IPermission extends IBase, IRouteMeta {
    name?: string;
    code: string;
    type: PermissionType;
    path?: string;
    layout?: string;
    component?: string;
    redirect?: string;
    children?: IPermission[];
    description: string;
}

export const PERMISSION_CONTAINER_ID = "000000000000000000000004";

export type GetPermNodeQuery = {
    status: EnableStatus;
};

export type PermNodeResult = IPermission;

//#region create permission, update permission

const commonActionFields = ["type", "title", "code", "description"] as const;
export const createMenuActionFields = [...commonActionFields, "parent"] as const;
export const updateMenuActionFields = [...commonActionFields, "_id"] as const;

const commonMenuGroupFields = [...commonActionFields, "layout", "path", "icon", "visible"] as const;
export const createMenuGroupFields = [...commonMenuGroupFields, "parent"] as const;
export const updateMenuGroupFields = [...commonMenuGroupFields, "_id"] as const;

export const commonItemFields = [
    ...commonActionFields,
    "path",
    "icon",
    "visible",
    "name",
    "component",
    "pinned",
    "cacheable",
    "forName",
    "pathKey",
    "iframe",
    "footer",
] as const;
export const createMenuItemFields = [...commonItemFields, "parent"] as const;
export const updateMenuItemFields = [...commonItemFields, "_id"] as const;

export interface CreateMenuGroupBody
    extends Pick<IPermission & { parent?: string }, typeof createMenuGroupFields[number]> {}
export interface UpdateMenuGroupBody extends Pick<IPermission, typeof updateMenuGroupFields[number]> {}

export interface CreateMenuItemBody
    extends Pick<IPermission & { parent?: string }, typeof createMenuItemFields[number]> {}
export interface UpdateMenuItemBody extends Pick<IPermission, typeof updateMenuItemFields[number]> {}

export interface CreateMenuActionBody
    extends Pick<IPermission & { parent?: string }, typeof createMenuActionFields[number]> {}
export interface UpdateMenuActionBody extends Pick<IPermission, typeof updateMenuActionFields[number]> {}

export type CreateGroupRules = ValidatorRules<CreateMenuGroupBody>;
export type UpdateGroupRules = ValidatorRules<UpdateMenuGroupBody>;

export type CreateMenuItemRules = ValidatorRules<CreateMenuItemBody>;
export type UpdateMenuItemRules = ValidatorRules<UpdateMenuItemBody>;

export type CreateMenuActionRules = ValidatorRules<CreateMenuActionBody>;
export type UpdateMenuActionRules = ValidatorRules<UpdateMenuActionBody>;

type AllPermRules = ValidatorRules<Omit<IPermission & { parent?: string }, "createdAt" | "updatedAt" | "status">>;

function getAllPermRules(requireHttp = false, requireIframe = false): AllPermRules {
    return {
        title: {
            required: true,
            min: 2,
            max: 32,
            message: "标题长度为 2-32 个字符",
        },
        code: [
            {
                required: true,
                pattern: "^[A-Za-z0-9/]{2,32}$",
                message: "长度为 2-32 个英文字母、数字、/",
            },
        ],
        type: {
            required: true,
            enum: PermissionTypeEnum as any,
        },
        description: {
            min: 0,
            max: 1024,
            message: "描述信息为 0-1024 位字符！",
            trigger: ["change"],
        },
        name: {
            required: true,
            pattern: "^[A-Za-z0-9]{2,32}$",
            message: "长度为 2-32 个英文字母或数字",
        },
        path: requireHttp
            ? {
                  required: true,
                  type: "url",
                  message: "以 http(s):// 开头的地址",
              }
            : {
                  pattern: "^[A-Za-z0-9-_/:]+$",
                  message: "路由路径不能为空，且为英文字母、数字、-_/:的组合",
              },
        component: {
            required: true,
            pattern: "^[A-Za-z0-9]+$",
            message: "组件路径不能为空，且为英文字母、数字的组合",
        },
        visible: {
            type: "boolean",
        },
        iframe: {
            required: requireIframe,
            type: "url",
            message: "以 http(s):// 开头的地址",
        },
        footer: {
            type: "boolean",
        },
        _id: {
            required: true,
            len: 24,
            message: "请提供有效的权限的 ID ！",
        },
        parent: {
            required: false,
            len: 24,
            message: "请提供有效的父权限的 ID ！",
        },
    };
}

export function getCreateActionRules(): CreateMenuActionRules {
    const allRules = getAllPermRules();
    return pick(allRules, createMenuActionFields);
}

export function getUpdateActionRules(): UpdateMenuActionRules {
    const allRules = getAllPermRules();
    return pick(allRules, updateMenuActionFields);
}

export function getCreateGroupRules(): CreateGroupRules {
    const allRules = getAllPermRules();
    return pick(allRules, createMenuGroupFields);
}
export function getUpdateGroupRules(): UpdateGroupRules {
    const allRules = getAllPermRules();
    return pick(allRules, updateMenuGroupFields);
}

export function getCreateItemRules(requireHttp: boolean, requireIframe: boolean): CreateMenuItemRules {
    const allRules = getAllPermRules(requireHttp, requireIframe);
    return pick(allRules, createMenuItemFields);
}
export function getUpdateItemRules(requireHttp: boolean, requireIframe: boolean): UpdateMenuItemRules {
    const allRules = getAllPermRules(requireHttp, requireIframe);
    return pick(allRules, updateMenuItemFields);
}

//#endregion

//#region reorder

export interface ReorderPermsBody {
    permId: string;
    permIds: string[];
}

//#endregion
