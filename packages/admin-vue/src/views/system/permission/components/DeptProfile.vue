<template>
    <el-descriptions class="deptProfile el-descriptions--custom" :column="1" border>
        <template #extra>
            <el-button-group>
                <el-button type="warning">编辑</el-button>
                <el-button type="danger">删除</el-button>
            </el-button-group>
        </template>
        <el-descriptions-item label="上级部门">
            {{ parent || "无" }}
        </el-descriptions-item>
        <el-descriptions-item label="部门名称">
            {{ dept.name }}
        </el-descriptions-item>
        <el-descriptions-item label="负责人">
            {{ dept.managers.join("，") || "无" }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
            <ReadonlySwitch
                v-model="dept.status"
                readonly
                active-text="启用"
                active-value="enabled"
                inactive-text="停用"
                inactive-value="disabled"
                :loading="state.loading"
            />
        </el-descriptions-item>
        <el-descriptions-item label="描述">
            {{ dept.description }}
        </el-descriptions-item>
    </el-descriptions>
</template>

<script setup lang="ts" name="DeptProfile">
import { computed, PropType, reactive } from "vue";
import { DeptTreeNodesResult } from "admin-common";

const props = defineProps({
    parent: {
        type: String,
        default: undefined,
    },
    dept: {
        type: Object as PropType<DeptTreeNodesResult>,
        required: true,
    },
});
const state = reactive({
    loading: false,
});
</script>

<style scoped lang="scss">
.deptProfile {
}
</style>
