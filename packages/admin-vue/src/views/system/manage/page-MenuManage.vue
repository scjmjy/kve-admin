<template>
    <el-row class="menuManage" :gutter="20">
        <el-col :xs="24" :sm="5" style="margin-bottom: 20px">
            <!-- <el-input v-model="state.deptKeyword" placeholder="输入部门名称进行筛选" :prefix-icon="Search" /> -->
            <div class="menuManage-filter">
                <el-switch v-model="state.includeDeleted" active-text="包含已删除" />
            </div>
            <el-tree
                ref="refTree"
                v-loading="state.loading"
                class="menuManage-tree"
                node-key="_id"
                :data="menuNodes"
                :props="treeProps"
                highlight-current
                default-expand-all
                :expand-on-click-node="false"
                draggable
                :allow-drag="allowDrag"
                :allow-drop="allowDrop"
                @node-drop="onNodeDrop"
                @current-change="onCurrentNodeChange"
            >
                <template #default="{ node, data }">
                    <span class="menuManage-node">
                        <span>{{ node.label }}</span>
                        <MenuTypeTag
                            style="margin-left: 5px"
                            :model-value="data.type"
                            compact
                            effect="plain"
                        ></MenuTypeTag>
                    </span>
                </template>
            </el-tree>
        </el-col>
        <el-col :xs="24" :sm="19">
            <el-tabs v-model="state.currentTab" class="menuManage-tabs" type="border-card">
                <el-tab-pane label="菜单信息" name="profile">
                    <transition name="transition-3d">
                        <keep-alive name="MenuProfile">
                            <MenuProfile
                                v-if="state.currentNode"
                                :parent="state.parentNodeName"
                                :menu="state.currentNode"
                                @create="onMenuCreate"
                            ></MenuProfile>
                        </keep-alive>
                    </transition>
                </el-tab-pane>
            </el-tabs>
        </el-col>
    </el-row>
</template>

<script setup lang="ts" name="MenuManage">
import { computed, nextTick, onActivated, reactive, ref, watch } from "vue";
import { ElTree } from "element-plus";
import { clone } from "lodash";
import { PermNodeResult } from "admin-common";
import { deepFindMenu, filterDeletedMenuNodes } from "./composables/useMenuNodes";
import { getPermNodes } from "@/api/permission";
import MenuProfile from "./components/MenuProfile.vue";

type NodeType = PermNodeResult;

interface TreeNode {
    parent: TreeNode;
    data: NodeType;
    childNodes: TreeNode[];
}

const treeProps = {
    label: "title",
    children: "children",
    class(data: Record<string, any>) {
        return `is-${data.status || "unknown"}`;
    },
};
const state = reactive({
    loading: false,
    includeDeleted: false,
    permNodes: undefined as Undefinable<PermNodeResult>,
    currentNodeKey: "",
    currentNode: undefined as Undefinable<NodeType>,
    parentNodeName: "",
    currentTab: "profile",
});

const menuNodes = computed(() => {
    if (!state.permNodes) {
        return [];
    }
    const nodes = [clone(state.permNodes)];
    if (!state.includeDeleted) {
        filterDeletedMenuNodes(nodes);
    }
    return nodes;
});

watch(
    () => menuNodes.value,
    (nodes) => {
        if (nodes.length === 0) {
            return;
        }
        nextTick(() => {
            if (state.currentNode) {
                // 找到并更新当前节点
                state.currentNode = deepFindMenu(nodes, state.currentNode._id);
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
    return getPermNodes().then((res) => {
        state.permNodes = res.data;
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
    const dept = deepFindMenu([state.permNodes!], deptId)!;
    const newChildNodes = dropNode.parent.childNodes;
    const newOrder = newChildNodes.map((item) => item.data._id);
    // await reorderDepts({
    //     deptId,
    //     deptIds: newOrder,
    // });
    // // 按照最新的顺序重新排序
    // dept.depts.sort((a, b) => {
    //     return newOrder.findIndex((id) => a._id === id) - newOrder.findIndex((id) => b._id === id);
    // });
}

function onCurrentNodeChange(data: NodeType, node: TreeNode) {
    state.currentNode = data;
    if (node.parent) {
        state.parentNodeName = node.parent.data.title || "";
    } else {
        state.parentNodeName = "";
    }
}

function onMenuCreate() {
    fetch();
}
</script>

<style scoped lang="scss">
.menuManage {
    &-tree {
        margin-top: 10px;
    }
    &-node {
        display: inline-flex;
        align-items: center;
    }
    &-tabs {
        box-shadow: 0 2px 5px #808080a6;
    }
}
</style>
