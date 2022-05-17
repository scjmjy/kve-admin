<template>
    <div class="menuProfile">
        <el-descriptions class="el-descriptions--custom" :column="column" border>
            <template #extra>
                <el-button-group size="small">
                    <el-button
                        v-if="menu.type === 'menugroup'"
                        icon="Plus"
                        type="primary"
                        :loading="state.loading"
                        @click="onAddClick"
                        >添加子菜单</el-button
                    >
                    <template v-if="parent">
                        <el-button
                            icon="Edit"
                            type="warning"
                            :loading="state.loading"
                            :disabled="menu.status !== 'enabled'"
                            @click="onEditClick"
                            >编辑</el-button
                        >
                        <el-button
                            icon="Delete"
                            type="danger"
                            :disabled="menu.status === 'deleted'"
                            :loading="state.loading"
                            @click="updatePermStatus('deleted')"
                            >删除</el-button
                        >
                        <el-button
                            icon="Check"
                            type="success"
                            :disabled="menu.status === 'enabled'"
                            :loading="state.loading"
                            @click="updatePermStatus('enabled')"
                            >启用</el-button
                        >
                        <el-button
                            icon="Close"
                            type="warning"
                            :disabled="menu.status !== 'enabled'"
                            :loading="state.loading"
                            @click="updatePermStatus('disabled')"
                            >禁用</el-button
                        >
                    </template>
                </el-button-group>
            </template>
            <el-descriptions-item label="上级菜单">
                {{ parent?.title || "无" }}
            </el-descriptions-item>
            <el-descriptions-item v-if="parent" label="菜单类型">
                <MenuTypeTag :model-value="menu.type" size="default"></MenuTypeTag>
            </el-descriptions-item>
            <el-descriptions-item label="菜单标题">
                {{ menu.title }}
            </el-descriptions-item>
            <el-descriptions-item v-if="menu.type !== 'action'" label="菜单图标">
                <SvgIcon v-if="menu.icon" :icon="menu.icon" />
            </el-descriptions-item>
            <el-descriptions-item v-if="state.menuName" label="菜单名称"> {{ state.menuName }} </el-descriptions-item>
            <el-descriptions-item label="权限标识">
                {{ menu.code }}
            </el-descriptions-item>
            <el-descriptions-item v-if="parent && menu.type !== 'action'" label="菜单路径">
                <input
                    type="text"
                    :value="normalizePath(parentFullpath, menu.path || '')"
                    readonly
                    style="outline: none; border: none"
                />
            </el-descriptions-item>
            <el-descriptions-item v-if="parent && menu.type === 'menugroup'" label="布局名称">
                {{ layoutOpts.find((opt) => opt.value === menu.layout)?.label || menu.layout }}
            </el-descriptions-item>
            <el-descriptions-item v-if="state.componentPath" label="组件路径">
                {{ state.componentPath }}
            </el-descriptions-item>
            <el-descriptions-item v-if="menu.type === 'menuitem' && !menu.visible" label="高亮菜单">
                {{ menu.forName }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
                <StatusTag v-model="menu.status" />
            </el-descriptions-item>
            <el-descriptions-item v-if="menu.type === 'menuitem'" label="是否显示">
                {{ menu.visible ? "是" : "否" }}
            </el-descriptions-item>
            <el-descriptions-item
                v-if="menu.type === 'menuitem' && menu.component !== ExternalLinkEnum.ExternalLink"
                label="是否固定"
            >
                {{ menu.pinned ? "是" : "否" }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
                {{ formatDate(menu.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
                {{ formatDate(menu.updatedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="描述">
                {{ menu.description }}
            </el-descriptions-item>
        </el-descriptions>

        <CrudFormDlg
            v-model="state.showCrudFormDlg"
            :action="formAction"
            :actions="formActions"
            :items="formItems"
            :form-data="formData"
            :form-props="{ labelWidth: '95px' }"
            :rules="formRules"
        ></CrudFormDlg>
    </div>
</template>

<script setup lang="ts" name="MenuProfile">
import { computed, PropType, reactive, ref } from "vue";
import { pick } from "lodash";
import {
    PermNodeResult,
    CreateMenuActionBody,
    CreateMenuGroupBody,
    CreateMenuItemBody,
    UpdateMenuActionBody,
    UpdateMenuGroupBody,
    UpdateMenuItemBody,
    getCreateGroupRules,
    getCreateItemRules,
    getCreateActionRules,
    getUpdateItemRules,
    getUpdateGroupRules,
    getUpdateActionRules,
    createMenuGroupFields,
    updateMenuGroupFields,
    createMenuItemFields,
    updateMenuItemFields,
    createMenuActionFields,
    updateMenuActionFields,
    ExternalLinkEnum,
} from "admin-common";
import { FormAction, FormActions, ItemSchema } from "@/components/form/CrudForm.vue";
import { createPerm, updatePerm, enablePerm } from "@/api/permission";
import { formatDate } from "@/utils/date";
import { useResponsiveCollumn } from "@/composables/useDescriptions";
import { usePageModules } from "@/composables/usePageModules";
import { useLayout } from "@/layout";
import { isExternalLink } from "@/utils/is";
import { normalizePath } from "@/utils/url";

import { usePermInject, updateOriginalMenu, updateOriginalMenuStatus } from "../composables/useMenuNodes";

type CreatePermBody = CreateMenuActionBody & CreateMenuGroupBody & CreateMenuItemBody;
type UpdatePermBody = UpdateMenuActionBody & UpdateMenuGroupBody & UpdateMenuItemBody;

const props = defineProps({
    parentFullpath: {
        type: String,
        default: "",
    },
    parent: {
        type: Object as PropType<PermNodeResult>,
        default: undefined,
    },
    menu: {
        type: Object as PropType<PermNodeResult>,
        required: true,
    },
});

const state = reactive({
    loading: false,
    showCrudFormDlg: false,
    menuName: computed(() => {
        if (props.menu.type !== "menuitem") {
            return "";
        }
        const isExternal =
            props.menu.component === ExternalLinkEnum.ExternalLink ||
            props.menu.component === ExternalLinkEnum.ExternalLinkIframe;
        if (isExternal) {
            return "";
        }
        return props.menu.name;
    }),
    componentPath: computed(() => {
        if (props.menu.type !== "menuitem") {
            return "";
        }
        const isExternal =
            props.menu.component === ExternalLinkEnum.ExternalLink ||
            props.menu.component === ExternalLinkEnum.ExternalLinkIframe;
        if (isExternal) {
            return "";
        }
        return props.menu.component;
    }),
});

const { permOriginal, fetchPerm, resetPermCurrentKey } = usePermInject();

const { column } = useResponsiveCollumn();

const formData = ref({} as Partial<CreatePermBody & UpdatePermBody>);

const formAction = ref<FormAction>();

const formActions = ref<FormActions>({
    apis: {
        async create() {
            state.loading = true;
            await createPerm(formData.value as CreatePermBody).finally(() => {
                state.loading = false;
            });
            state.showCrudFormDlg = false;
            fetchPerm();
        },
        async read(action) {
            if (action === "update") {
                let filterFields: string[] = [];
                formData.value = {} as any;
                switch (props.menu.type) {
                    case "menugroup":
                        filterFields = updateMenuGroupFields as any;
                        break;
                    case "menuitem":
                        filterFields = updateMenuItemFields as any;
                        break;
                    case "action":
                        filterFields = updateMenuActionFields as any;
                        break;
                }
                Object.assign(formData.value, pick(props.menu, filterFields));
            }
        },
        async update() {
            state.loading = true;
            await updatePerm(formData.value as UpdatePermBody).finally(() => {
                state.loading = false;
            });
            state.showCrudFormDlg = false;
            updateOriginalMenu(permOriginal.value, props.menu._id, formData.value);
            resetPermCurrentKey();
        },
    },
});

const { pageModuleOpts } = usePageModules();
const { layoutOpts } = useLayout();

const formItems = computed(() => {
    const isExternal =
        formData.value.component === ExternalLinkEnum.ExternalLink ||
        formData.value.component === ExternalLinkEnum.ExternalLinkIframe;
    const isExternalIframe = formData.value.component === ExternalLinkEnum.ExternalLinkIframe;

    const { children } = formAction.value === "create" ? props.menu : props.parent || {};
    const forNameOpts = children
        ? children
              .filter((item) => !!item.name)
              .map((item) => ({ label: `${item.name}(${item.title})`, value: item.name! }))
        : [];

    const pathPrefix =
        formAction.value === "create"
            ? normalizePath(props.parentFullpath, props.menu.path || "")
            : props.parentFullpath;

    const items: ItemSchema[] = [
        {
            label: "父菜单",
            prop: "parent",
            span: 6,
            item: {
                type: "BasicSelect",
                props: {
                    readonly: true,
                    options: [
                        {
                            label: props.menu.title!,
                            value: props.menu._id,
                        },
                    ],
                },
            },
        },
        {
            label: "菜单类型",
            prop: "type",
            span: 24,
            item: {
                type: "MenuTypeRadio",
            },
        },
        {
            label: "菜单标题",
            prop: "title",
            item: {
                type: "ElInput",
                props: {
                    clearable: true,
                },
            },
        },
        {
            label: "组件路径",
            prop: "component",
            item: {
                type: "BasicSelect",
                props: {
                    clearable: true,
                    options: pageModuleOpts,
                    onChange(val: string) {
                        if (val) {
                            const data = formData.value;
                            data.name = val;
                            if (val === ExternalLinkEnum.ExternalLink) {
                                if (!data.path) {
                                    data.path = "https://";
                                }
                            } else if (val === ExternalLinkEnum.ExternalLinkIframe) {
                                if (!data.iframe) {
                                    data.iframe = "https://";
                                }
                            } else {
                                if (!data.path) {
                                    data.path = val.toLowerCase();
                                }
                                if (!data.code) {
                                    data.code = data.path;
                                }
                            }
                        }
                    },
                },
            },
        },
        {
            label: "布局名称",
            prop: "layout",
            item: {
                type: "BasicSelect",
                props: {
                    options: layoutOpts,
                },
            },
        },
        {
            label: "路由名称",
            prop: "name",
            visible: !isExternal,
            item: {
                type: "ElInput",
                props: {
                    placeholder: "此菜单对应的路由名称",
                    disabled: true,
                },
            },
        },
        {
            label: "路由路径",
            prop: "path",
            tooltip: {
                content: "‘/’开头表示绝对路径",
            },
            item: {
                type: "PathInput",
                props: {
                    prefix: pathPrefix,
                    onChange(val: string) {
                        if (!formData.value.code && !isExternalLink(val)) {
                            formData.value.code = val;
                        }
                    },
                },
            },
        },
        {
            label: "内嵌网页",
            prop: "iframe",
            visible: isExternalIframe,
            tooltip: {
                content: "内嵌 http(s):// 开头的网页地址",
            },
            item: {
                type: "ElInput",
                props: { clearable: true },
            },
        },
        {
            label: "权限标识",
            prop: "code",
            item: {
                type: "ElInput",
                props: {
                    placeholder: "全局唯一的标识",
                },
            },
        },
        {
            label: "菜单图标",
            prop: "icon",
            item: {
                type: "IconSelectInput",
                props: {
                    clearable: true,
                },
            },
        },
        {
            label: "是否缓存",
            prop: "cacheable",
            visible: !isExternal,
            tooltip: {
                content: "是否被 <keep-alive> 缓存，路由名称必须与组件名称一致",
            },
            item: {
                type: "ReadonlySwitch",
                props: {
                    activeText: "缓存",
                    inactiveText: "不缓存",
                },
            },
        },
        {
            label: "是否显示",
            prop: "visible",
            tooltip: {
                content: "是否在 AppMenu 中显示",
            },
            item: {
                type: "ReadonlySwitch",
                props: {
                    activeText: "显示",
                    inactiveText: "不显示",
                    onChange(val: string | number | boolean) {
                        if (val) {
                            (formData.value as CreateMenuItemBody).forName = "";
                        }
                    },
                },
            },
        },
        {
            label: "高亮菜单",
            prop: "forName",
            visible: !formData.value.visible,
            tooltip: {
                content: "此菜单激活时所高亮的菜单项(仅在 visible=false 时有效)",
            },
            item: {
                type: "BasicSelect",
                props: {
                    placeholder: "填写需要高亮的路由名称",
                    allowCreate: true,
                    filterable: true,
                    options: forNameOpts,
                },
            },
        },
        {
            label: "是否固定",
            prop: "pinned",
            tooltip: {
                content: "是否被固定在 TabList 最开头",
            },
            item: {
                type: "ReadonlySwitch",
                props: {
                    activeText: "固定",
                    inactiveText: "不固定",
                },
            },
        },
        {
            label: "路由区分",
            prop: "pathKey",
            visible: !isExternal,
            tooltip: {
                content: "是否使用 route.fullPath 来区分路由",
            },
            item: {
                type: "ReadonlySwitch",
                props: {
                    activeText: "fullPath",
                    activeValue: "fullPath",
                    inactiveText: "path",
                    inactiveValue: "path",
                },
            },
        },
        {
            label: "描述",
            prop: "description",
            span: 24,
            item: {
                type: "ElInput",
                props: {
                    type: "textarea",
                    clearable: true,
                },
            },
        },
    ];
    let filterFields: string[] = [];
    if (formAction.value === "create") {
        switch (formData.value.type) {
            case "menugroup":
                filterFields = createMenuGroupFields as any;
                break;
            case "menuitem":
                filterFields = createMenuItemFields as any;
                break;
            case "action":
                filterFields = createMenuActionFields as any;
                break;
        }
    } else {
        switch (formData.value.type) {
            case "menugroup":
                filterFields = updateMenuGroupFields as any;
                break;
            case "menuitem":
                filterFields = updateMenuItemFields as any;
                break;
            case "action":
                filterFields = updateMenuActionFields as any;
                break;
        }
    }
    return items.filter((item) => filterFields.includes(item.prop));
});

const formRules = computed(() => {
    const requireHttp = formData.value.component === ExternalLinkEnum.ExternalLink;
    const requireIframe = formData.value.component === ExternalLinkEnum.ExternalLinkIframe;
    if (formAction.value === "create") {
        switch (formData.value.type) {
            case "menugroup":
                return getCreateGroupRules();
            case "menuitem":
                return getCreateItemRules(requireHttp, requireIframe);
            case "action":
                return getCreateActionRules();
        }
    } else {
        switch (formData.value.type) {
            case "menugroup":
                return getUpdateGroupRules();
            case "menuitem":
                return getUpdateItemRules(requireHttp, requireIframe);
            case "action":
                return getUpdateActionRules();
        }
    }
});

function onAddClick() {
    formAction.value = "create";
    formData.value = {
        parent: props.menu._id,
        type: "menugroup",
        cacheable: true,
        visible: true,
        pinned: false,
        pathKey: "fullPath",
    };
    state.showCrudFormDlg = true;
}
function onEditClick() {
    formAction.value = "update";
    state.showCrudFormDlg = true;
}

async function updatePermStatus(status: EnableStatus) {
    state.loading = true;
    await enablePerm(props.menu!._id, status).finally(() => {
        state.loading = false;
    });
    updateOriginalMenuStatus(permOriginal.value, props.menu._id, status);
    resetPermCurrentKey();
}
</script>

<style scoped lang="scss">
.menuProfile {
}
</style>
