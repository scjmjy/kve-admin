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
                                @create="onDeptCreate"
                                @update="onDeptUpdate"
                                @status="resetCurrentKey"
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
                                @create="onRoleCreate"
                                @update="resetCurrentKey"
                                @status="resetCurrentKey"
                                @dragdrop="resetCurrentKey"
                            ></DeptRoleManage>
                        </keep-alive>
                    </transition>
                </el-tab-pane>
                <el-tab-pane label="用户管理" name="user">
                    <transition name="transition-3d">
                        <keep-alive name="DeptUserManage">
                            <DeptUserManage
                                v-if="state.currentTab === 'user'"
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
import { computed, nextTick, onActivated, reactive, ref, watch } from "vue";
import { clone } from "lodash";
import { DeptTreeNodesResult, UpdateDeptBody } from "admin-common";
import { ElTree } from "element-plus";
import { getDeptTreeNodes, reorderDepts } from "@/api/department";
import DeptProfile from "./components/DeptProfile.vue";
import DeptRoleManage from "./components/DeptRoleManage.vue";
import DeptUserManage from "./components/DeptUserManage.vue";
import { deepFindOriginalDept, filterDeletedDeptNodes } from "./composables/useDeptNodes";

interface TreeNode {
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
    deptTreeNode: undefined as Undefinable<DeptTreeNodesResult>,
    currentNodeKey: "",
    currentNode: undefined as Undefinable<DeptTreeNodesResult>,
    parentNodeName: "",
    currentTab: "profile",
});

const deptNodes = computed(() => {
    if (!state.deptTreeNode) {
        return [];
    }
    const node = clone(state.deptTreeNode);
    if (!state.includeDeleted) {
        filterDeletedDeptNodes(node);
    }

    return [node];
});

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
            }
            refTree.value?.setCurrentKey(state.currentNode._id);
        });
    },
);

const refTree = ref<InstanceType<typeof ElTree>>();

function fetch() {
    state.loading = true;
    return getDeptTreeNodes()
        .then((res) => {
            state.deptTreeNode = res.data;
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
    const dept = deepFindOriginalDept(state.deptTreeNode!, deptId)!;
    const newChildNodes = dropNode.parent.childNodes;
    const newOrder = newChildNodes.map((item) => item.data._id);
    await reorderDepts({
        deptId,
        deptIds: newOrder,
    });
    // 按照最新的顺序重新排序
    dept.depts.sort((a, b) => {
        return newOrder.findIndex((id) => a._id === id) - newOrder.findIndex((id) => b._id === id);
    });
}

function onCurrentNodeChange(data: DeptTreeNodesResult, node: TreeNode) {
    state.currentNode = data;
    if (node.parent) {
        state.parentNodeName = node.parent.data.name;
    } else {
        state.parentNodeName = "";
    }
}

function onDeptCreate() {
    fetch();
}

function onDeptUpdate(data: UpdateDeptBody) {
    const found = deepFindOriginalDept(state.deptTreeNode!, data._id);
    if (found) {
        Object.assign(found, data);
        nextTick(() => {
            refTree.value?.setCurrentKey(state.currentNode!._id);
        });
    }
}
function resetCurrentKey(deptId: string) {
    nextTick(() => {
        refTree.value?.setCurrentKey(deptId);
    });
}
function onRoleCreate() {
    fetch();
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
