<template>
    <CrudTable
        ref="crudTable"
        v-model:showCrudFormDlg="state.showCrudFormDlg"
        v-model:formAction="crudForm.action"
        :header="tableHeader"
        :request-api="getUserList"
        :post-handler="postHandler"
        :actions="tableActions"
        :columns="tableColumns"
        :selection="state.tableSelection"
        :filter-form-data="filterFormData"
        :filter-items="filterItems"
        :filter="tableFilter"
        :on-filter-change="onFilterChange"
        :form-data="formData"
        :form-items="formItems"
        :form-rules="formRules"
        :form-actions="crudForm.actions"
    >
        <template #header-actions>
            <el-button
                icon="Check"
                type="success"
                :loading="state.loading"
                :disabled="state.tableSelection.length === 0"
                @click="onEnableClick('enabled')"
                >启用</el-button
            >
            <el-button
                icon="Close"
                type="warning"
                :loading="state.loading"
                :disabled="state.tableSelection.length === 0"
                @click="onEnableClick('disabled')"
                >禁用</el-button
            >
        </template>
    </CrudTable>
</template>

<script setup lang="ts" name="DeptUserManage">
import { computed, PropType, reactive, ref, shallowReactive, shallowRef, watch } from "vue";
import {
    CreateUserBody,
    UpdateUserBody,
    getUserRules,
    DeptTreeNodesResult,
    FindUsersResult,
    UserFilter,
    USER_SUPERADMIN_ID,
} from "admin-common";
import { ElMessageBox } from "element-plus";
import { isEmpty } from "lodash";
import { enableUsers, getUserList } from "@/api/user";
import { CrudFormProps, ItemSchema } from "@/components/form/CrudForm.vue";
import CrudTable, { CrudTableColumn, TableActionColumn, TableHeader } from "@/components/table/CrudTable.vue";
import { createUser, deleteUser, updateUser } from "@/api/user";
import { extractAllDepts, extractAllRoles } from "../composables/useDeptNodes";
import { isDept, makeDeepRoleNode, RoleNode } from "../composables/useRoleNodes";
import { formatDate } from "@/utils/date";

// export type PostHandler<DataT> = (list: DataT[]) => void;

type DataListType = FindUsersResult["list"];
type DataType = DataListType[0];

const props = defineProps({
    dept: {
        type: Object as PropType<DeptTreeNodesResult>,
        required: true,
    },
    root: {
        type: Object as PropType<DeptTreeNodesResult>,
        required: true,
    },
});

const crudTable = ref<InstanceType<typeof CrudTable>>();

const state = reactive({
    loading: false,
    showCrudFormDlg: false,
    tableSelection: [] as DataType[],
    disabled: computed(() => props.dept.status !== "enabled"),
    allDeptIds: computed(() => extractAllDepts(props.root)),
    allRoleIds: computed(() => extractAllRoles(props.root)),
});

const tableHeader = computed<TableHeader<DataType>>(() => {
    return {
        title: "用户列表",
        selection: {
            selectable(row: DataType) {
                if (row._id === USER_SUPERADMIN_ID) {
                    return false;
                }

                return true;
            },
        },
        selectionBtnProps: {
            disabled: state.disabled,
        },
        onAddClick() {
            makeCreateFormData();
            crudForm.action = "create";
            state.showCrudFormDlg = true;
        },
        addBtnProps: {
            disabled: state.disabled,
        },
        async onDeleteManyClick(selection: DataType[]) {
            const ids = selection.map((user) => user._id);
            await enableUsers(ids, "deleted");
        },
        deleteBtnProps: {
            disabled: state.disabled || state.tableSelection.length === 0,
        },
    };
});

async function onEnableClick(status: EnableStatus) {
    const ids = state.tableSelection.map((user) => user._id);
    const { deletable } = crudForm.actions || {};
    let which = "";
    if (typeof deletable === "string") {
        const names: string[] = [];
        state.tableSelection.forEach((item: any) => {
            names.push(item[deletable]);
        });
        which = `【${names.join(", ")}】`;
    }
    await ElMessageBox.confirm(`你确定${status === "enabled" ? "启用" : "禁用"}${which}吗？`, "温馨提示");
    state.loading = true;
    await enableUsers(ids, status).finally(() => {
        state.loading = false;
    });
    crudTable.value?.navigateToPage();
}

let currentRow: DataType | undefined;

function postHandler(list: DataType[]) {
    list.forEach((item) => {
        item.createdAt = formatDate(item.createdAt);
        item.updatedAt = formatDate(item.updatedAt);
    });
}

type FilterFormData = Partial<Record<UserFilter | "includeChildren", any>>;
const filterFormData = reactive<FilterFormData>({
    includeChildren: true,
});

const filterItems: ItemSchema[] = [
    {
        label: "含子部门",
        prop: "includeChildren",
        item: {
            type: "ElSwitch",
            props: {
                activeText: "是",
                activeValue: true,
                inactiveValue: false,
            },
        },
    },
    {
        label: "状态",
        prop: "status",
        item: {
            type: "StatusSelect",
            props: {
                clearable: true,
            },
        },
    },
    {
        label: "用户名",
        prop: "username",
        item: {
            type: "ElInput",
            props: {
                clearable: true,
            },
        },
    },
    {
        label: "真实姓名",
        prop: "realname",
        item: {
            type: "ElInput",
            props: {
                clearable: true,
            },
        },
    },
    {
        label: "手机号码",
        prop: "mobileno",
        item: {
            type: "ElInput",
            props: {
                clearable: true,
            },
        },
    },
    {
        label: "邮箱",
        prop: "email",
        item: {
            type: "ElInput",
            props: {
                clearable: true,
            },
        },
    },
    {
        label: "创建日期",
        prop: "createdAt",
        span: 12,
        item: {
            type: "ElDatePicker",
            props: {
                clearable: true,
                type: "daterange",
                startPlaceholder: "开始日期",
                endPlaceholder: "结束日期",
            },
        },
    },
];

const tableFilter = ref<Partial<PaginationFilter<UserFilter>>>({});

watch(
    () => props.dept,
    (dept) => {
        const depts = filterFormData.includeChildren ? extractAllDepts(dept) : [dept._id];
        tableFilter.value.depts = {
            comparison: "in",
            value: depts,
        };
        if (dept.status !== "enabled") {
            crudTable.value?.toggleMultiSelect();
        }
    },
    { immediate: true },
);

function onFilterChange(filterData: FilterFormData) {
    tableFilter.value = {};

    const depts = filterData.includeChildren ? extractAllDepts(props.dept) : [props.dept._id];
    tableFilter.value.depts = {
        comparison: "in",
        value: depts,
    };

    let key: keyof FilterFormData;
    for (key in filterData) {
        const value = filterData[key];
        if (key === "includeChildren") {
            continue;
        }
        if (isEmpty(value)) {
            delete tableFilter.value[key];
        } else if (Array.isArray(value)) {
            tableFilter.value[key] = {
                comparison: "range",
                value,
            };
        } else {
            tableFilter.value[key] = {
                comparison: "regex",
                value,
            };
        }
    }
}

const tableColumns = shallowRef<CrudTableColumn<DataType>[]>([
    {
        props: {
            prop: "thumbnail",
            label: "头像",
            align: "center",
            width: 70,
        },
        slot: {
            name: "UserAvatar",
            props: {
                useDefault: true,
            },
        },
    },
    {
        props: {
            prop: "username",
            label: "用户名",
            showOverflowTooltip: true,
            width: 120,
        },
    },
    {
        props: {
            prop: "realname",
            label: "真实姓名",
            showOverflowTooltip: true,
            width: 120,
        },
    },
    {
        props: {
            prop: "mobileno",
            label: "手机号码",
            showOverflowTooltip: true,
        },
    },
    // {
    //     props: {
    //         prop: "email",
    //         label: "邮箱",
    //         showOverflowTooltip: true,
    //     },
    // },
    {
        props: {
            prop: "depts",
            label: "所属部门",
            showOverflowTooltip: true,
            formatter(row, col, value: DataType["depts"], index) {
                return value?.map((dept) => dept.name).join(", ");
            },
        },
    },
    {
        props: {
            prop: "roles",
            label: "拥有角色",
            showOverflowTooltip: true,
            formatter(row, col, value: DataType["roles"], index) {
                return value?.map((role) => role.name).join(", ");
            },
        },
    },
    {
        props: {
            prop: "status",
            label: "状态",
            align: "center",
            width: 70,
        },
        slot: {
            name: "StatusTag",
            props: {},
        },
    },
    {
        props: {
            prop: "createdAt",
            label: "创建时间",
            showOverflowTooltip: true,
        },
    },
]);

const tableActions = shallowRef<TableActionColumn<DataType>>({
    props: {
        label: "操作",
        align: "center",
        width: "130px",
    },
    buttons: [
        {
            label: "详情",
            onClick(row) {
                if (row._id === USER_SUPERADMIN_ID) {
                    crudForm.actions!.deletable = false;
                } else {
                    crudForm.actions!.deletable = true;
                }
                currentRow = row;
                crudForm.action = "read";
                state.showCrudFormDlg = true;
            },
            props: {
                type: "primary",
                text: true,
            },
        },
    ],
    dropdowns: {
        more: "更多",
        onCommand(command, row) {
            switch (command) {
                case "edit":
                    currentRow = row;
                    crudForm.action = "update";
                    state.showCrudFormDlg = true;
                    break;
                case "delete":
                    ElMessageBox.confirm(`你确定删除【${row.username}】吗？`, "温馨提示").then(() => {
                        deleteUser(row._id).then(() => {
                            crudTable.value?.navigateToPage();
                        });
                    });

                    break;

                default:
                    break;
            }
        },
        items: [
            {
                label: "编辑",
                props: {
                    command: "edit",
                },
            },
            {
                label: "删除",
                props(row) {
                    const p = {
                        command: "delete",
                        disabled: false,
                    };
                    if (row._id === USER_SUPERADMIN_ID) {
                        p.disabled = true;
                    }
                    return p;
                },
            },
        ],
    },
});

/**
 * 用于 create 的 formdata
 */
function makeCreateFormData() {
    formData.value = {
        username: "",
        realname: "",
        password: "",
        mobileno: "",
        email: "",
        gender: undefined,
        depts: [],
        roles: [],
    };
}

/**
 * 用于 update 的 formdata
 */
function makeUpdateFormData(row: DataType) {
    const { _id, username, realname, mobileno, email, gender, depts, roles } = row;
    formData.value = {
        _id,
        username: username,
        realname: realname,
        password: "",
        mobileno: mobileno,
        email: email,
        gender: gender,
        depts: depts.map((item) => item._id),
        roles: roles.map((item) => item._id),
    };
}

/**
 * 用于 read 的 formdata
 */
function makeReadFormData(row: DataType) {
    const { _id, username, realname, mobileno, email, gender, depts, roles, status, createdAt, updatedAt } = row;
    formData.value = {
        _id, // 用于 delete
        username,
        realname,
        mobileno,
        email,
        gender,
        status,
        depts,
        roles,
        createdAt,
        updatedAt,
    };
}

const formData = ref({} as CreateUserBody | UpdateUserBody | Omit<DataType, "_id" | "thumbnail">);

const crudForm = shallowReactive<Omit<CrudFormProps, "column" | "formData">>({
    action: "create",
    actions: {
        deletable: "username",
        apis: {
            async create() {
                await createUser(formData.value as CreateUserBody);
                state.showCrudFormDlg = false;
            },
            async read(forAction) {
                if (forAction === "read") {
                    makeReadFormData(currentRow!);
                } else {
                    makeUpdateFormData(currentRow!);
                }
            },
            async update() {
                await updateUser(formData.value as UpdateUserBody);
                state.showCrudFormDlg = false;
            },
            async delete() {
                await deleteUser((formData.value as UpdateUserBody)._id);
                state.showCrudFormDlg = false;
            },
        },
    },
});

const formRules = computed(() => {
    if (crudForm.action === "create") {
        return getUserRules(crudForm.action);
    } else if (crudForm.action === "update") {
        return getUserRules(crudForm.action);
    }
});

/**
 * 把 dept 的所有 roles 提取到一个 string[] 里
 * @param dept
 * @param filters 只有包含在此数组里的 dept 的 roles 才会返回
 */
function extractAllRoles2(roleNode: RoleNode) {
    const ids: string[] = [];
    if (isDept(roleNode)) {
        for (const node of roleNode.roles) {
            ids.push(...extractAllRoles2(node));
        }
    } else {
        ids.push(roleNode._id);
    }
    return ids;
}

const formItems = computed<ItemSchema[]>(() => {
    let roleNodes: RoleNode[] = [];
    if (formData.value.depts && crudForm.action !== "read") {
        const depts = formData.value.depts as string[];
        depts.sort((a, b) => {
            return state.allDeptIds.indexOf(a) - state.allDeptIds.indexOf(b);
        });
        const roleNode = makeDeepRoleNode(props.root, depts);
        if (roleNode) {
            roleNodes.push(roleNode);
        }
    }
    const items: ItemSchema[] = [
        {
            label: "用户名",
            prop: "username",
            item: {
                type: "ElInput",
                props: {
                    clearable: true,
                },
            },
        },
        {
            label: "真实姓名",
            prop: "realname",
            item: {
                type: "ElInput",
                props: {
                    clearable: true,
                },
            },
        },
        {
            label: "密码",
            prop: "password",
            item: {
                type: "ElInput",
                props: {
                    type: "password",
                    showPassword: true,
                    clearable: true,
                },
            },
        },
        {
            label: "性别",
            prop: "gender",
            item: {
                type: "GenderSelect",
            },
        },
        {
            label: "手机号码",
            prop: "mobileno",
            item: {
                type: "ElInput",
                props: {
                    clearable: true,
                },
            },
        },
        {
            label: "邮箱",
            prop: "email",
            item: {
                type: "ElInput",
                props: {
                    clearable: true,
                },
            },
        },
        {
            label: "所属部门",
            prop: "depts",
            item: {
                type: "BasicTreeSelect",
                props: {
                    props: {
                        label: "name",
                        value: "_id",
                        children: "depts",
                    },
                    nodeKey: "_id",
                    data: [props.root],
                    checkStrictly: true,
                    defaultExpandAll: true,
                    multiple: true,
                    onChange(depts: string[]) {
                        depts.sort((a, b) => {
                            return state.allDeptIds.indexOf(a) - state.allDeptIds.indexOf(b);
                        });
                        const roleNode = makeDeepRoleNode(props.root, depts)!;
                        const validRoles = extractAllRoles2(roleNode);
                        // 选中的部门改变了，过滤掉无效的角色
                        formData.value.roles = (formData.value.roles as string[]).filter((role) =>
                            validRoles.includes(role),
                        );
                    },
                },
            },
        },
        {
            label: "拥有角色",
            prop: "roles",
            item: {
                type: "BasicTreeSelect",
                props: {
                    props: {
                        label: "name",
                        value: "_id",
                        children: "roles",
                    },
                    nodeKey: "_id",
                    defaultExpandAll: true,
                    data: roleNodes,
                    multiple: true,
                    onChange(roles: string[]) {
                        roles.sort((a, b) => {
                            return state.allRoleIds.indexOf(a) - state.allRoleIds.indexOf(b);
                        });
                    },
                },
            },
        },
    ];

    if (crudForm.action === "read") {
        items.push({
            label: "状态",
            prop: "status",
            item: {
                type: "StatusSelect",
            },
        });
        items.push({
            label: "创建时间",
            prop: "createdAt",
            item: {
                type: "ElInput",
            },
        });
        items.push({
            label: "更新时间",
            prop: "updatedAt",
            item: {
                type: "ElInput",
            },
        });
    }
    return items;
});
</script>

<style scoped lang="scss">
.deptUserManage {
    &-filter {
        border-bottom: 1px solid var(--el-border-color);
        margin-bottom: 10px;
    }
    &-header {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
    }
    &-title {
        font-size: bold;
    }
    &-actions {
        margin-left: 20px;
        margin-right: auto;
    }
    &-table {
        width: 100%;
    }
    &-pagination {
        margin-top: 5px;
        justify-content: flex-end;
    }
}
</style>
