<template>
    <div class="cacheManage">
        <el-descriptions :column="column" border title="缓存信息">
            <template #extra>
                <el-button-group size="small">
                    <el-button icon="Refresh" type="primary" :loading="state.refreshing" @click="onRefreshClick"
                        >刷新</el-button
                    >
                    <el-button icon="Delete" type="danger" :loading="state.clearing" @click="onClearClick"
                        >清空缓存</el-button
                    >
                </el-button-group>
            </template>
            <el-descriptions-item v-for="(item, index) in cacheInfo.items" :key="index" :label="item.label">
                {{ item.value }}
            </el-descriptions-item>
        </el-descriptions>

        <el-table
            class="cacheManage-table"
            v-loading="state.refreshing"
            :data="cacheInfo.rows"
            stripe
            show-summary
            style="margin-top: 20px"
        >
            <el-table-column
                v-for="col of cacheInfo.columns"
                :label="col.label"
                :prop="col.prop"
                :key="col.prop"
                sortable
            >
            </el-table-column>
        </el-table>
    </div>
</template>

<script setup lang="ts" name="CacheManage">
import { onActivated, reactive, ref } from "vue";
import { CacheInfoResult } from "admin-common";
import { useResponsiveCollumn } from "@/composables/useDescriptions";
import { clearCache, getCacheInfo } from "@/api/monitor";
import { ElMessageBox } from "element-plus";

const { column } = useResponsiveCollumn();

const cacheInfo = ref<CacheInfoResult>({
    items: [],
    columns: [],
    rows: [],
});

const state = reactive({
    refreshing: false,
    clearing: false,
});

onActivated(() => {
    onRefreshClick();
});

function onRefreshClick() {
    state.refreshing = true;

    getCacheInfo()
        .then((res) => {
            cacheInfo.value = res.data;
        })
        .finally(() => {
            state.refreshing = false;
        });
}

async function onClearClick() {
    await ElMessageBox.confirm("确认清空缓存吗？", "警告");
    clearCache().finally(() => {
        state.clearing = false;
    });
}
</script>

<style scoped lang="scss">
.cacheManage {
    display: flex;
    flex-direction: column;
    &-table {
        flex: 1;
    }
}
</style>
