<template>
    <el-row class="menuManage" :gutter="20" v-loading="state.loading">
        <el-col :md="24" :lg="5">
            <!-- <el-input v-model="state.deptKeyword" placeholder="输入部门名称进行筛选" :prefix-icon="Search" /> -->
            <div class="menuManage-filter">
                <el-switch v-model="state.includeDeleted" active-text="包含已删除" />
            </div>
            <el-tree
                ref="refTree"
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
        <el-col :md="24" :lg="19">
            <el-tabs v-model="state.currentTab" class="menuManage-tabs" type="border-card">
                <el-tab-pane label="菜单信息" name="profile">
                    <transition name="transition-3d">
                        <keep-alive name="MenuProfile">
                            <MenuProfile
                                v-if="state.currentNode"
                                :parentFullpath="state.parentFullpath"
                                :parent="state.parent"
                                :menu="state.currentNode"
                            ></MenuProfile>
                        </keep-alive>
                    </transition>
                </el-tab-pane>
            </el-tabs>
        </el-col>
    </el-row>
</template>

<script setup lang="ts" name="MenuManage">
import { computed, nextTick, onActivated, provide, reactive, ref, toRef, watch } from "vue";
import { ElTree } from "element-plus";
import { cloneDeep } from "lodash";
import { PermNodeResult } from "admin-common";
import {
    symbolFetchPerm,
    symbolPermOriginal,
    symbolResetPermCurrentKey,
    deepFindMenu,
    filterDeletedMenuNodes,
} from "./composables/useMenuNodes";
import { getPermNodes, dragDropPerms } from "@/api/permission";
import MenuProfile from "./components/MenuProfile.vue";
import { normalizePath } from "@/utils/url";

type NodeType = PermNodeResult;

interface TreeNode {
    key: string;
    level: number;
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
    parent: undefined as Undefinable<PermNodeResult>,
    parentFullpath: "",
    currentTab: "profile",
});

provide(symbolFetchPerm, fetch);
provide(symbolPermOriginal, toRef(state, "permNodes"));
provide(symbolResetPermCurrentKey, resetCurrentKey);

const menuNodes = computed(() => {
    if (!state.permNodes) {
        return [];
    }
    const nodes = [cloneDeep(state.permNodes)];
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
                state.parent = undefined;
            }
            refTree.value?.setCurrentKey(state.currentNode._id);
        });
    },
);

const refTree = ref<InstanceType<typeof ElTree>>();

function fetch() {
    state.loading = true;
    return getPermNodes()
        .then((res) => {
            state.permNodes = res.data;
        })
        .finally(() => {
            state.loading = false;
        });
}

onActivated(() => {
    fetch();
});

function allowDrag(node: TreeNode) {
    return node.level > 1;
}

let draggingNodeParentId: string | undefined = undefined;

function allowDrop(draggingNode: TreeNode, dropNode: TreeNode, type: "prev" | "inner" | "next") {
    // 如果是 dropNode 是根节点，那只能拖进去
    if (dropNode.level === 1 && type !== "inner") {
        return false;
    }
    // 动作菜单不能有子菜单
    if (type === "inner" && dropNode.data.type === "action") {
        return false;
    }
    // 菜单项里只能包含动作
    if (type === "inner" && dropNode.data.type === "menuitem" && draggingNode.data.type !== "action") {
        return false;
    }
    draggingNodeParentId = draggingNode.parent.data._id;
    return true;
}

async function onNodeDrop(draggingNode: TreeNode, dropNode: TreeNode, type: "before" | "after" | "inner") {
    const body: DragDropBody = {
        draggingId: draggingNode.data._id,
        draggingParentId: draggingNodeParentId || "",
        dropId: dropNode.data._id,
        dropParentId: dropNode.parent.data._id,
        type,
        returnNew: true,
    };

    state.loading = true;
    const res = await dragDropPerms(body).finally(() => {
        state.loading = false;
    });
    if (res.data) {
        state.permNodes = res.data;
    }
}

function onCurrentNodeChange(data: NodeType, node: TreeNode) {
    // console.log("[onCurrentNodeChange]", node);
    state.currentNode = data;
    if (node.parent && node.parent.key) {
        state.parent = node.parent.data;
        let currentNode: TreeNode = node;
        let parentFullpath = "";
        while ((currentNode = currentNode.parent) && currentNode.key) {
            parentFullpath = normalizePath(currentNode.data.path || "", parentFullpath);
        }
        state.parentFullpath = parentFullpath;
    } else {
        state.parent = undefined;
        state.parentFullpath = "";
    }
}

function resetCurrentKey(permId?: string) {
    if (!permId) {
        permId = state.currentNode?._id;
    }
    if (permId) {
        nextTick(() => {
            refTree.value?.setCurrentKey(permId!);
        });
    }
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
        .el-tree-node.is-drop-inner > .el-tree-node__content & {
            > span {
                background-color: var(--el-color-primary);
            }
        }
    }
    &-tabs {
        box-shadow: 0 2px 5px #808080a6;
    }
}
</style>
