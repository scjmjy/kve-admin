<template>
    <el-row class="deptRoleManage" :gutter="20">
        <el-col :xs="24" :sm="9" style="margin-bottom: 20px">
            <el-switch v-model="state.deep" active-text="包含子部门" />
            <el-tree
                ref="refTree"
                class="permissionManage-tree"
                node-key="_id"
                :data="roleTreeNodes"
                :props="treeProps"
                highlight-current
                :expand-on-click-node="false"
                @node-click="onTreeNodeClick"
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
                    <el-button-group>
                        <el-button type="warning" :disabled="!!state2.deptInfo">编辑</el-button>
                        <el-button type="danger" :disabled="!!state2.deptInfo">删除</el-button>
                    </el-button-group>
                </template>
                <template v-if="state2.deptInfo">
                    <el-descriptions-item label="部门名称">{{ state2.deptInfo.name }} </el-descriptions-item>
                    <el-descriptions-item label="拥有角色">{{ state2.deptInfo.roles }} </el-descriptions-item>
                </template>
                <template v-else-if="state2.roleInfo">
                    <el-descriptions-item label="角色名称">{{ state2.roleInfo.name }} </el-descriptions-item>
                    <el-descriptions-item label="状态">
                        <ReadonlySwitch
                            v-model="state2.roleInfo.status"
                            readonly
                            active-text="启用"
                            active-value="enabled"
                            inactive-text="停用"
                            inactive-value="disabled"
                            :loading="state.loading"
                        />
                    </el-descriptions-item>
                    <el-descriptions-item label="描述">{{ state2.roleInfo.description }} </el-descriptions-item>
                </template>
            </el-descriptions>
        </el-col>
    </el-row>
</template>

<script setup lang="ts" name="DeptRoleManage">
import { computed, PropType, reactive, watch } from "vue";
import { DeptTreeNodesResult } from "admin-common";

type RoleType = DeptTreeNodesResult["roles"][0];
interface DeptNode extends Pick<RoleType, "_id" | "name"> {
    roles: RoleNode[];
}
type RoleNode = RoleType | DeptNode;

interface TreeNode {
    parent: TreeNode;
    data: RoleNode;
}

function isDept(node: RoleNode): node is DeptNode {
    if ("roles" in node) {
        return true;
    }
    return false;
}

function makeDeepNode(dept: DeptTreeNodesResult): RoleNode {
    if (!dept.depts.length) {
        return {
            _id: dept._id,
            name: dept.name,
            roles: Array.from(dept.roles),
        };
    } else {
        const deptNode = {
            _id: dept._id,
            name: dept.name,
            roles: Array.from(dept.roles) as RoleNode[],
        };
        for (const d of dept.depts) {
            const node = makeDeepNode(d);
            deptNode.roles.push(node);
        }
        return deptNode;
    }
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
};

const state = reactive({
    deep: false,
    loading: false,
    currentNode: undefined as Undefinable<RoleNode>,
});

const state2 = reactive({
    deptInfo: computed(() => {
        const { currentNode } = state;
        if (!currentNode || !isDept(currentNode)) {
            return undefined;
        }
        return {
            name: currentNode.name,
            roles: currentNode.roles
                .filter((role) => !isDept(role))
                .map((role) => role.name)
                .join("，"),
        };
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
    if (state.deep) {
        return [makeDeepNode(props.dept)];
    } else {
        return [
            {
                _id: props.dept._id,
                name: props.dept.name,
                roles: props.dept.roles,
            },
        ];
    }
});

watch(
    () => roleTreeNodes,
    () => {
        state.currentNode = undefined;
    },
    {
        deep: true,
    },
);

function onTreeNodeClick(data: RoleNode, node: TreeNode) {
    state.currentNode = data;
}
</script>

<style scoped lang="scss">
.deptRoleManage {
}
</style>
