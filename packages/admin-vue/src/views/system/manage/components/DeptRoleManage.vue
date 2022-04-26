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
                class="deptProfile el-descriptions--custom"
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
                            v-if="state2.roleInfo"
                            icon="Delete"
                            type="danger"
                            :disabled="state.disabled || state2.roleInfo.status === 'deleted'"
                            :loading="state.loading"
                            @click="updateRoleStatus('deleted')"
                            >删除</el-button
                        >
                        <el-button
                            v-if="state2.roleInfo"
                            icon="Check"
                            type="success"
                            :disabled="state.disabled || state2.roleInfo.status === 'enabled'"
                            :loading="state.loading"
                            @click="updateRoleStatus('enabled')"
                            >启用</el-button
                        >
                        <el-button
                            v-if="state2.roleInfo"
                            icon="Close"
                            type="warning"
                            :disabled="state.disabled || state2.roleInfo.status !== 'enabled'"
                            :loading="state.loading"
                            @click="updateRoleStatus('disabled')"
                            >禁用</el-button
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
            v-model="state.showCrudFormDlg"
            :action="formAction"
            :actions="formActions"
            :column="1"
            :items="formItems"
            :form-data="formData"
            :rules="formRules"
        ></CrudFormDlg>
    </el-row>
</template>

<script setup lang="ts" name="DeptRoleManage">
import { computed, nextTick, PropType, reactive, ref, watch } from "vue";
import { ElTree } from "element-plus";
import {
    CreateRoleBody,
    DeptTreeNodesResult,
    getCreateRoleRules,
    getUpdateRoleRules,
    UpdateRoleBody,
} from "admin-common";
import { FormAction, FormActions, ItemSchema } from "@/components/form/CrudForm.vue";
import { createRole, enableRole, reorderRoles, updateRole } from "@/api/department";
import {
    isDept,
    makeDeepRoleNode,
    RoleType,
    RoleNode,
    deepFindRole,
    deepFindDept,
    filterDeletedRoleNodes,
} from "../composables/useRoleNodes";
import { deepFindOriginalDept } from "../composables/useDeptNodes";
import { formatDate } from "@/utils/date";

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

const emit = defineEmits(["create", "update", "status", "dragdrop"]);

const treeProps = {
    label: "name",
    children: "roles",
    class(data: Record<string, any>) {
        return `is-${data.status || "unknown"}`;
    },
};

const state = reactive({
    includeDeleted: false,
    deep: false,
    loading: false,
    currentNode: undefined as Undefinable<RoleNode>,
    showCrudFormDlg: false,
    disabled: computed(() => props.dept.status !== "enabled"),
});

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
            state.showCrudFormDlg = false;
            emit("create", formData.value);
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
                state.loading = true;
            });
            state.showCrudFormDlg = false;
            Object.assign(state.currentNode, formData.value);
            emit("update", props.dept._id);
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
        emit("dragdrop", props.dept._id);
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
    state.showCrudFormDlg = true;
}

function onEditClick() {
    formAction.value = "update";
    state.showCrudFormDlg = true;
}

async function updateRoleStatus(status: EnableStatus) {
    state.loading = true;
    await enableRole(state2.roleInfo!._id, status).finally(() => {
        state.loading = false;
    });
    state2.roleInfo!.status = status;
    nextTick(() => {
        emit("status", props.dept._id);
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
