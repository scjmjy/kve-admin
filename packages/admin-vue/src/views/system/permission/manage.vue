<template>
    <el-row class="permissionManage" :gutter="20">
        <el-col :xs="24" :sm="5" style="margin-bottom: 20px">
            <!-- <el-input v-model="state.deptKeyword" placeholder="输入部门名称进行筛选" :prefix-icon="Search" /> -->
            <el-tree
                ref="refTree"
                class="permissionManage-tree"
                node-key="_id"
                :data="state.deptTreeNodes"
                :props="treeProps"
                highlight-current
                default-expand-all
                :expand-on-click-node="false"
                @node-click="onTreeNodeClick"
            />
        </el-col>
        <el-col :xs="24" :sm="19">
            <el-tabs
                v-if="state.currentNode"
                v-model="state.currentTab"
                class="permissionManage-tabs"
                type="border-card"
            >
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
                                :dept="state.currentNode"
                            ></DeptUserManage>
                        </keep-alive>
                    </transition>
                </el-tab-pane>
            </el-tabs>
        </el-col>
    </el-row>
</template>

<script setup lang="ts" name="PermissionManage">
import { computed, nextTick, onActivated, reactive, ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { DeptTreeNodesResult } from "admin-common";
import { ElTree } from "element-plus";
import { getDeptTreeNodes } from "@/api/permission";
import DeptProfile from "./components/DeptProfile.vue";
import DeptRoleManage from "./components/DeptRoleManage.vue";
import DeptUserManage from "./components/DeptUserManage.vue";

interface TreeNode {
    parent: TreeNode;
    data: DeptTreeNodesResult;
}

const treeProps = {
    label: "name",
    children: "depts",
};
const state = reactive({
    deptKeyword: "",
    deptTreeNodes: [] as DeptTreeNodesResult[],
    currentNodeKey: "",
    currentNode: undefined as Undefinable<DeptTreeNodesResult>,
    parentNodeName: "",
    currentTab: "profile",
});

const refTree = ref<InstanceType<typeof ElTree>>();

onActivated(() => {
    getDeptTreeNodes().then((res) => {
        state.deptTreeNodes = [res.data];
        state.currentNode = state.deptTreeNodes[0];
        nextTick(() => {
            refTree.value?.setCurrentKey(state.currentNode!._id);
        });
    });
});

function onTreeNodeClick(data: DeptTreeNodesResult, node: TreeNode) {
    state.currentNode = data;
    if (node.parent) {
        state.parentNodeName = node.parent.data.name;
    } else {
        state.parentNodeName = "";
    }
}
</script>

<style scoped lang="scss">
.permissionManage {
    &-tree {
        // margin-top: 20px;
    }
    &-tabs {
        box-shadow: 0 2px 5px #808080a6;
    }
}
</style>
