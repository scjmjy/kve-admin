<template>
    <el-row class="deptRoleManage" :gutter="20">
        <el-col :xs="24" :sm="9" style="margin-bottom: 20px">
            <div class="deptRoleManage-filter">
                <el-switch v-model="state.includeDeleted" active-text="包含已删除" />
                <el-switch v-model="state.deep" active-text="包含子部门" />
            </div>
            <el-tree
                ref="refTree"
                class="permissionManage-tree"
                node-key="_id"
                :data="roleTreeNodes"
                :props="treeProps"
                highlight-current
                default-expand-all
                :expand-on-click-node="false"
                draggable
                :allow-drag="allowDrag"
                :allow-drop="allowDrop"
                @node-drop="onNodeDrop"
                @current-change="onCurrentNodeChange"
            />
        </el-col>
        <el-col :xs="24" :sm="15">
            <el-descriptions
                v-if="state2.deptInfo || state2.roleInfo"
                class="deptProfile el-descriptions--hideTitle"
                :column="1"
                border
            >
                <template #extra>
                    <el-button-group size="small">
                        <el-button
                            v-if="state2.deptInfo"
                            icon="Plus"
                            type="primary"
                            :disabled="state.disabled || !!state2.roleInfo"
                            :loading="state.loading"
                            @click="onAddClick"
                            >添加角色</el-button
                        >
                        <el-button
                            v-if="state2.roleInfo"
                            icon="Edit"
                            type="warning"
                            :disabled="state.disabled || state2.roleInfo.status !== 'enabled'"
                            :loading="state.loading"
                            @click="onEditClick"
                            >编辑</el-button
                        >
                        <el-button
                            v-if="state2.roleInfo && state2.roleInfo._id !== ROLE_SUPERADMIN_ID"
                            icon="Delete"
                            type="danger"
                            :disabled="state.disabled || state2.roleInfo.status === 'deleted'"
                            :loading="state.loading"
                            @click="updateRoleStatus('deleted')"
                            >删除</el-button
                        >
                        <el-button
                            v-if="state2.roleInfo && state2.roleInfo._id !== ROLE_SUPERADMIN_ID"
                            icon="Check"
                            type="success"
                            :disabled="state.disabled || state2.roleInfo.status === 'enabled'"
                            :loading="state.loading"
                            @click="updateRoleStatus('enabled')"
                            >启用</el-button
                        >
                        <el-button
                            v-if="state2.roleInfo && state2.roleInfo._id !== ROLE_SUPERADMIN_ID"
                            icon="Close"
                            type="warning"
                            :disabled="state.disabled || state2.roleInfo.status !== 'enabled'"
                            :loading="state.loading"
                            @click="updateRoleStatus('disabled')"
                            >禁用</el-button
                        >
                        <el-button
                            v-if="state2.roleInfo && state2.roleInfo._id !== ROLE_SUPERADMIN_ID"
                            icon="Menu"
                            type="primary"
                            :disabled="state.disabled || state2.roleInfo.status !== 'enabled'"
                            :loading="state.loading"
                            @click="state.showPermDlg = true"
                            >菜单权限</el-button
                        >
                    </el-button-group>
                </template>
                <template v-if="state2.deptInfo">
                    <el-descriptions-item label="部门名称">{{ state2.deptInfo.name }} </el-descriptions-item>
                    <el-descriptions-item label="状态">
                        <StatusTag v-model="state2.deptInfo.status" />
                    </el-descriptions-item>
                    <el-descriptions-item label="包含角色">{{ state2.deptInfo.roles }} </el-descriptions-item>
                </template>
                <template v-else-if="state2.roleInfo">
                    <el-descriptions-item label="角色名称">{{ state2.roleInfo.name }} </el-descriptions-item>
                    <el-descriptions-item label="状态">
                        <StatusTag v-model="state2.roleInfo.status" />
                    </el-descriptions-item>
                    <el-descriptions-item min-width="80px" label="菜单权限">
                        {{ state2.roleInfo.perms.map((perm) => perm.title || "").join(", ") }}
                    </el-descriptions-item>
                    <el-descriptions-item label="描述">{{ state2.roleInfo.description }} </el-descriptions-item>
                    <el-descriptions-item label="创建时间">
                        {{ formatDate(state2.roleInfo.createdAt) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="更新时间">
                        {{ formatDate(state2.roleInfo.updatedAt) }}
                    </el-descriptions-item>
                </template>
            </el-descriptions>
        </el-col>
        <CrudFormDlg
            v-model="state.showRoleDlg"
            :action="formAction"
            :actions="formActions"
            :column="1"
            :items="formItems"
            :form-data="formData"
            :rules="formRules"
        ></CrudFormDlg>
        <CrudFormDlg
            v-model="state.showPermDlg"
            action="update"
            :actions="formActionsPerm"
            :column="1"
            :items="formItemsPerm"
            :form-data="formDataPerm"
        ></CrudFormDlg>
    </el-row>
</template>

<script setup lang="ts" name="DeptRoleManage">
import { computed, inject, nextTick, PropType, reactive, Ref, ref, watch } from "vue";
import { ElTree } from "element-plus";
import {
    CreateRoleBody,
    DeptTreeNodesResult,
    getCreateRoleRules,
    getUpdateRoleRules,
    UpdateRoleBody,
    UpdateRolePermsBody,
    PermNodeResult,
    ROLE_SUPERADMIN_ID,
} from "admin-common";
import { FormAction, FormActions, ItemSchema } from "@/components/form/CrudForm.vue";
import { createRole, enableRole, reorderRoles, updateRole, updateRolePerms } from "@/api/department";
import { makePermTreeSelectOpts, extractAllPermIds, sortPermIds } from "../composables/useMenuNodes";
import {
    isDept,
    makeDeepRoleNode,
    RoleType,
    RoleNode,
    deepFindRole,
    deepFindDept,
    filterDeletedRoleNodes,
} from "../composables/useRoleNodes";
import {
    deepFindOriginalDept,
    updateOriginalRole,
    updateOriginalRoleStatus,
    useDeptInject,
    updateOriginalRolePerms,
} from "../composables/useDeptNodes";
import { formatDate } from "@/utils/date";
import { getPermNodes } from "@/api/permission";

interface TreeNode {
    parent: TreeNode;
    data: RoleNode;
    childNodes: TreeNode[];
}

const props = defineProps({
    dept: {
        type: Object as PropType<DeptTreeNodesResult>,
        required: true,
    },
});

const treeProps = {
    label: "name",
    children: "roles",
    class(data: Record<string, any>) {
        return `is-${data.status || "unknown"}`;
    },
};

const { deptOriginal, fetchDept, resetDeptCurrentKey } = useDeptInject();

const state = reactive({
    includeDeleted: false,
    deep: false,
    loading: false,
    currentNode: undefined as Undefinable<RoleNode>,
    showRoleDlg: false,
    showPermDlg: false,
    disabled: computed(() => props.dept.status !== "enabled"),
    permNode: undefined as Undefinable<PermNodeResult>,
});

let g_allPermIds: string[] = [];

const state2 = reactive({
    deptInfo: computed(() => {
        const { currentNode } = state;
        if (currentNode && isDept(currentNode)) {
            return {
                name: currentNode.name,
                status: currentNode.status,
                roles: currentNode.roles
                    .filter((role) => !isDept(role))
                    .map((role) => role.name)
                    .join("，"),
            };
        }
    }),
    roleInfo: computed(() => {
        const { currentNode } = state;
        if (currentNode && !isDept(currentNode)) {
            return currentNode;
        }
        return undefined;
    }),
});

const roleTreeNodes = computed<RoleNode[]>(() => {
    let node: RoleNode | undefined;
    if (state.deep && props.dept.depts.length) {
        node = makeDeepRoleNode(props.dept);
    }
    if (!node) {
        node = {
            _id: props.dept._id,
            name: props.dept.name,
            status: props.dept.status,
            roles: props.dept.roles,
        };
    }
    if (!state.includeDeleted) {
        filterDeletedRoleNodes(node);
    }
    return [node];
});
type ElTreeInstance = InstanceType<typeof ElTree>;
const refTree = ref<ElTreeInstance>();

watch(
    () => roleTreeNodes.value,
    (nodes) => {
        if (state.currentNode && isDept(state.currentNode)) {
            state.currentNode = deepFindDept(nodes, state.currentNode._id);
        }
        if (state.currentNode && !isDept(state.currentNode)) {
            state.currentNode = deepFindRole(nodes, state.currentNode._id);
        }
        if (!state.currentNode) {
            state.currentNode = nodes[0];
        }

        nextTick(() => {
            refTree.value?.setCurrentKey(state.currentNode!._id);
        });
    },
    {
        immediate: true,
    },
);

const formData = ref({} as UpdateRoleBody | CreateRoleBody);

const formAction = ref<FormAction>();

const formActions = ref<FormActions>({
    apis: {
        async create() {
            state.loading = true;
            await createRole(formData.value as CreateRoleBody).finally(() => {
                state.loading = false;
            });
            state.showRoleDlg = false;
            fetchDept();
        },
        async read(action) {
            if (action === "update") {
                const { _id, name, description } = state.currentNode as RoleType;
                formData.value = {
                    _id,
                    name,
                    description,
                };
            }
        },
        async update() {
            state.loading = true;
            await updateRole(formData.value as UpdateRoleBody).finally(() => {
                state.loading = false;
            });
            state.showRoleDlg = false;
            updateOriginalRole(deptOriginal.value, state.currentNode!._id, formData.value);
            resetDeptCurrentKey();
        },
    },
});

const formItems = computed(() => {
    const items: ItemSchema[] = [
        {
            label: "角色名称",
            prop: "name",
            item: {
                type: "ElInput",
                props: {
                    clearable: true,
                },
            },
        },
        {
            label: "状态",
            prop: "status",
            visible: formAction.value === "read",
            item: {
                type: "StatusSelect",
                props: {},
            },
        },
        {
            label: "描述",
            prop: "description",
            item: {
                type: "ElInput",
                props: {
                    type: "textarea",
                    clearable: true,
                },
            },
        },
    ];
    return items;
});

const formRules = computed(() => {
    if (formAction.value === "create") {
        return getCreateRoleRules();
    }
    return getUpdateRoleRules();
});

async function fetchPermNode() {
    if (state.permNode) {
        return;
    }
    const res = await getPermNodes({
        status: "enabled",
    });
    state.permNode = res.data;
    g_allPermIds = extractAllPermIds(state.permNode);
}

const formDataPerm = ref({} as UpdateRolePermsBody);

const formActionsPerm = ref<FormActions>({
    apis: {
        async read(action) {
            if (action === "update") {
                const { _id, perms } = state.currentNode as RoleType;
                formDataPerm.value = { _id, perms: perms.map((p) => p._id) };
                await fetchPermNode();
            }
        },
        async update() {
            state.loading = true;
            await updateRolePerms(formDataPerm.value).finally(() => {
                state.loading = false;
            });
            state.showPermDlg = false;
            updateOriginalRolePerms(
                deptOriginal.value,
                state.permNode!,
                formDataPerm.value._id,
                formDataPerm.value.perms,
            );
            resetDeptCurrentKey();
        },
    },
});

const formItemsPerm = computed<ItemSchema[]>(() => {
    const data = state.permNode ? makePermTreeSelectOpts(state.permNode) : [];
    return [
        {
            label: "权限",
            prop: "perms",
            item: {
                type: "BasicTreeSelect",
                props: {
                    defaultExpandAll: true,
                    multiple: true,
                    showCheckbox: true,
                    data,
                    nodeKey: "value",
                    checkStrictly: true,
                    // onChange(val: string[]) {
                    //     sortPermIds(val, g_allPermIds);
                    // },
                },
            },
        },
    ];
});

function allowDrag(node: TreeNode) {
    return !isDept(node.data);
}
function allowDrop(draggingNode: TreeNode, dropNode: TreeNode, type: "prev" | "inner" | "next") {
    // 只允许在同一层移动
    if (type === "inner" || isDept(dropNode.data) || draggingNode.parent !== dropNode.parent) {
        return false;
    }
    return true;
}

async function onNodeDrop(draggingNode: TreeNode, dropNode: TreeNode, type: "before" | "after" | "inner") {
    const deptId = dropNode.parent.data._id;
    const newChildNodes = dropNode.parent.childNodes;
    const newOrder = newChildNodes.filter((item) => !isDept(item.data)).map((item) => item.data._id);
    await reorderRoles({
        deptId,
        rolesIds: newOrder,
    });
    const dept = deepFindOriginalDept(props.dept, deptId)!;
    // 按照最新的顺序重新排序
    dept.roles.sort((a, b) => {
        return newOrder.findIndex((id) => a._id === id) - newOrder.findIndex((id) => b._id === id);
    });
    nextTick(() => {
        refTree.value?.setCurrentKey(draggingNode.data._id);
        state.currentNode = draggingNode.data;
    });
}
function onCurrentNodeChange(data: RoleNode, node: TreeNode) {
    state.currentNode = data;
}

function onAddClick() {
    formAction.value = "create";
    formData.value = {
        dept: props.dept._id,
    } as CreateRoleBody;
    state.showRoleDlg = true;
}

function onEditClick() {
    formAction.value = "update";
    state.showRoleDlg = true;
}

async function updateRoleStatus(status: EnableStatus) {
    state.loading = true;
    await enableRole(state2.roleInfo!._id, status).finally(() => {
        state.loading = false;
    });
    updateOriginalRoleStatus(deptOriginal.value, state.currentNode!._id, status);
    resetDeptCurrentKey();
    nextTick(() => {
        refTree.value?.setCurrentKey(state.currentNode!._id);
    });
}
</script>

<style scoped lang="scss">
.deptRoleManage {
    &-filter {
        margin-bottom: 10px;
        :deep(.el-switch) {
            margin-right: 10px;
        }
    }
}
</style>
