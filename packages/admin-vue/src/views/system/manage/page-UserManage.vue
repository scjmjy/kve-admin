<template>
    <el-row class="userManage" :gutter="20">
        <el-col :xs="24" :sm="5" style="margin-bottom: 20px">
            <!-- <el-input v-model="state.deptKeyword" placeholder="输入部门名称进行筛选" :prefix-icon="Search" /> -->
            <div class="userManage-filter">
                <el-switch v-model="state.includeDeleted" active-text="包含已删除" />
            </div>
            <el-tree
                ref="refTree"
                v-loading="state.loading"
                class="userManage-tree"
                node-key="_id"
                :data="deptNodes"
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
        <el-col :xs="24" :sm="19">
            <el-tabs v-if="state.currentNode" v-model="state.currentTab" class="userManage-tabs" type="border-card">
                <el-tab-pane label="部门信息" name="profile">
                    <transition name="transition-3d">
                        <keep-alive name="DeptProfile">
                            <DeptProfile
                                v-if="state.currentTab === 'profile'"
                                :parent="state.parentNodeName"
                                :dept="state.currentNode"
                            ></DeptProfile>
                        </keep-alive>
                    </transition>
                </el-tab-pane>
                <el-tab-pane label="角色管理" name="role">
                    <transition name="transition-3d">
                        <keep-alive name="DeptRoleManage">
                            <DeptRoleManage
                                v-if="state.currentTab === 'role'"
                                :dept="state.currentNode"
                            ></DeptRoleManage>
                        </keep-alive>
                    </transition>
                </el-tab-pane>
                <el-tab-pane label="用户管理" name="user">
                    <transition name="transition-3d">
                        <keep-alive name="DeptUserManage">
                            <DeptUserManage
                                v-if="state.currentTab === 'user'"
                                :root="deptNodes[0]"
                                :dept="state.currentNode"
                            ></DeptUserManage>
                        </keep-alive>
                    </transition>
                </el-tab-pane>
            </el-tabs>
        </el-col>
    </el-row>
</template>

<script setup lang="ts" name="UserManage">
import { computed, nextTick, onActivated, provide, reactive, ref, toRef, watch } from "vue";
import { cloneDeep } from "lodash";
import { DeptTreeNodesResult } from "admin-common";
import { ElTree } from "element-plus";
import { getDeptTreeNodes, reorderDepts } from "@/api/department";
import DeptProfile from "./components/DeptProfile.vue";
import DeptRoleManage from "./components/DeptRoleManage.vue";
import DeptUserManage from "./components/DeptUserManage.vue";
import {
    symbolFetchDept,
    symbolDeptOriginal,
    symbolResetDeptCurrentKey,
    deepFindOriginalDept,
    filterDeletedDeptNodes,
} from "./composables/useDeptNodes";

interface TreeNode {
    key: string;
    parent: TreeNode;
    data: DeptTreeNodesResult;
    childNodes: TreeNode[];
}

const treeProps = {
    label: "name",
    children: "depts",
    class(data: Record<string, any>) {
        return `is-${data.status || "unknown"}`;
    },
};
const state = reactive({
    loading: false,
    includeDeleted: false,
    deptOriginal: undefined as Undefinable<DeptTreeNodesResult>,
    currentNodeKey: "",
    currentNode: undefined as Undefinable<DeptTreeNodesResult>,
    parentNodeName: "",
    currentTab: "profile",
});

const deptNodes = computed(() => {
    if (!state.deptOriginal) {
        return [];
    }
    const nodes = [cloneDeep(state.deptOriginal)];

    if (!state.includeDeleted) {
        filterDeletedDeptNodes(nodes);
    }

    return nodes;
});

provide(symbolFetchDept, fetch);
provide(symbolDeptOriginal, toRef(state, "deptOriginal"));
provide(symbolResetDeptCurrentKey, resetCurrentKey);

watch(
    () => deptNodes.value,
    (nodes) => {
        if (nodes.length === 0) {
            return;
        }
        nextTick(() => {
            if (state.currentNode) {
                // 找到并更新当前节点
                state.currentNode = deepFindOriginalDept(nodes[0], state.currentNode._id);
            }
            if (!state.currentNode) {
                state.currentNode = nodes[0];
                state.parentNodeName = "";
            }
            refTree.value?.setCurrentKey(state.currentNode!._id);
        });
    },
);

const refTree = ref<InstanceType<typeof ElTree>>();

function fetch() {
    state.loading = true;
    return getDeptTreeNodes()
        .then((res) => {
            state.deptOriginal = res.data;
        })
        .finally(() => {
            state.loading = false;
        });
}

onActivated(() => {
    fetch();
});

function allowDrag(node: TreeNode) {
    return !!node.parent;
}
function allowDrop(draggingNode: TreeNode, dropNode: TreeNode, type: "prev" | "inner" | "next") {
    // 只允许在同一层移动
    if (type === "inner" || draggingNode.parent !== dropNode.parent) {
        return false;
    }
    return true;
}

async function onNodeDrop(draggingNode: TreeNode, dropNode: TreeNode, type: "before" | "after" | "inner") {
    const deptId = dropNode.parent.data._id;
    const newChildNodes = dropNode.parent.childNodes;
    const newOrder = newChildNodes.map((item) => item.data._id);
    await reorderDepts({
        deptId,
        deptIds: newOrder,
    });
    const dept = deepFindOriginalDept(state.deptOriginal!, deptId)!;
    // 按照最新的顺序重新排序
    dept.depts.sort((a, b) => {
        return newOrder.findIndex((id) => a._id === id) - newOrder.findIndex((id) => b._id === id);
    });
}

function onCurrentNodeChange(data: DeptTreeNodesResult, node: TreeNode) {
    state.currentNode = data;
    if (node.parent && node.parent.key) {
        state.parentNodeName = node.parent.data.name;
    } else {
        state.parentNodeName = "";
    }
}

function resetCurrentKey(deptId?: string) {
    if (!deptId) {
        deptId = state.currentNode?._id;
    }
    if (deptId) {
        nextTick(() => {
            refTree.value?.setCurrentKey(deptId!);
        });
    }
}
</script>

<style scoped lang="scss">
.userManage {
    &-tree {
        margin-top: 10px;
    }
    &-tabs {
        box-shadow: 0 2px 5px #808080a6;
    }
}
</style>
