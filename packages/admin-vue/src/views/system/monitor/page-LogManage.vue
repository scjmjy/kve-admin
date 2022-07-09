<template>
    <div class="logManage" v-loading="state.refreshing">
        <el-tabs type="border-card" v-model="state.tabName">
            <el-tab-pane label="访问日志" name="access">
                <div class="logManage-header">
                    <el-button-group size="small">
                        <el-button
                            type="danger"
                            v-has-perm="PERM_CODES.monitor_log_clearAccess"
                            @click="clearLog('access')"
                            >清空</el-button
                        >
                    </el-button-group>
                </div>
                <el-table :data="accessPagination.currentData.value" stripe>
                    <el-table-column type="expand">
                        <template #default="{ row }">
                            <el-descriptions border style="padding: 0 20px">
                                <el-descriptions-item label="用户 ID">{{ row.data.userId }}</el-descriptions-item>
                                <el-descriptions-item label="Query">{{ row.data.query }}</el-descriptions-item>
                                <el-descriptions-item label="Params">{{ row.data.params }}</el-descriptions-item>
                                <el-descriptions-item label="ReqBody">{{ row.data.reqBody }}</el-descriptions-item>
                                <el-descriptions-item label="Status">{{ row.data.status }}</el-descriptions-item>
                                <el-descriptions-item label="Level">
                                    <el-tag :color="row.level.colour"> {{ row.level.levelStr }}</el-tag>
                                </el-descriptions-item>
                            </el-descriptions>
                        </template>
                    </el-table-column>
                    <el-table-column label="用户名" prop="data.reqBody.username"> </el-table-column>
                    <el-table-column label="登录地址" prop="data.location"> </el-table-column>
                    <el-table-column label="登录 IP" prop="data.ip"> </el-table-column>
                    <el-table-column label="记录时间" prop="startTime" :formatter="formatter"> </el-table-column>
                    <el-table-column label="登录结果" prop="data.success" width="80px" center>
                        <template #default="{ row }">
                            <el-tag :type="row.data.success ? 'success' : 'danger'">
                                {{ row.data.success ? "成功" : "失败" }}</el-tag
                            >
                        </template>
                    </el-table-column>
                    <el-table-column label="消耗时间(ms)" prop="data.elapsedTime" sortable width="140px">
                    </el-table-column>
                </el-table>
                <el-pagination
                    class="el-pagination__right"
                    small
                    background
                    layout="total, sizes, prev, pager, next, jumper"
                    v-model:page-size="accessPagination.pageSize.value"
                    v-model:current-page="accessPagination.pageNum.value"
                    :total="accessLogItems.length"
                />
            </el-tab-pane>
            <el-tab-pane label="操作日志" name="operation">
                <div class="logManage-header">
                    <el-button-group size="small">
                        <el-button
                            type="danger"
                            v-has-perm="PERM_CODES.monitor_log_clearOp"
                            @click="clearLog('operation')"
                            >清空</el-button
                        >
                    </el-button-group>
                </div>
                <el-table :data="opPagination.currentData.value" stripe>
                    <el-table-column type="expand">
                        <template #default="{ row }">
                            <el-descriptions border style="padding: 0 20px">
                                <el-descriptions-item label="用户 ID">{{ row.data.userId }}</el-descriptions-item>
                                <el-descriptions-item label="Query">{{ row.data.query }}</el-descriptions-item>
                                <el-descriptions-item label="Params">{{ row.data.params }}</el-descriptions-item>
                                <el-descriptions-item label="ReqBody">{{ row.data.reqBody }}</el-descriptions-item>
                                <el-descriptions-item label="Status">{{ row.data.status }}</el-descriptions-item>
                                <el-descriptions-item label="Level">
                                    <el-tag :color="row.level.colour"> {{ row.level.levelStr }}</el-tag>
                                </el-descriptions-item>
                            </el-descriptions>
                        </template>
                    </el-table-column>
                    <el-table-column label="URL" prop="data.url"> </el-table-column>
                    <el-table-column label="method" prop="data.method" width="80px" center> </el-table-column>
                    <el-table-column label="用户名" prop="data.username"> </el-table-column>
                    <el-table-column label="操作地址" prop="data.location"> </el-table-column>
                    <el-table-column label="操作 IP" prop="data.ip"> </el-table-column>
                    <el-table-column label="记录时间" prop="startTime" :formatter="formatter"> </el-table-column>
                    <el-table-column label="操作结果" prop="data.success" width="80px" center>
                        <template #default="{ row }">
                            <el-tag :type="row.data.success ? 'success' : 'danger'">
                                {{ row.data.success ? "成功" : "失败" }}</el-tag
                            >
                        </template>
                    </el-table-column>
                    <el-table-column label="消耗时间(ms)" prop="data.elapsedTime" sortable width="140px">
                    </el-table-column>
                </el-table>
                <el-pagination
                    class="el-pagination__right"
                    small
                    background
                    layout="total, sizes, prev, pager, next, jumper"
                    v-model:page-size="opPagination.pageSize.value"
                    v-model:current-page="opPagination.pageNum.value"
                    :total="opLogItems.length"
                />
            </el-tab-pane>
            <el-tab-pane label="调试日志" name="debug">
                <div class="logManage-header">
                    <el-button-group size="small">
                        <el-button
                            type="danger"
                            v-has-perm="PERM_CODES.monitor_log_clearDebug"
                            @click="clearLog('debug')"
                            >清空</el-button
                        >
                    </el-button-group>
                </div>
                <el-table :data="debugPagination.currentData.value" stripe>
                    <el-table-column label="记录时间" prop="startTime" :formatter="formatter" width="180px">
                    </el-table-column>
                    <el-table-column label="调试信息" prop="data"> </el-table-column>
                    <el-table-column label="日志等级" width="100px" center>
                        <template #default="{ row }">
                            <el-tag :color="row.level.colour"> {{ row.level.levelStr }}</el-tag>
                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination
                    class="el-pagination__right"
                    small
                    background
                    layout="total, sizes, prev, pager, next, jumper"
                    v-model:page-size="debugPagination.pageSize.value"
                    v-model:current-page="debugPagination.pageNum.value"
                    :total="debugLogItems.length"
                />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script setup lang="ts" name="LogManage">
import { onActivated, reactive, ref, watch } from "vue";
import { AccessLogItem, DebugLogItem, LogCategoryEnum, OperationLogItem, PERM_CODES } from "admin-common";
import { TableColumnCtx } from "element-plus/es/components/table/src/table-column/defaults";
import { useClientPagination } from "@/composables/useTable";
import { getLogItems, clearLogItems } from "@/api/monitor";
import { formatDate } from "@/utils/date";
import { ElMessageBox } from "element-plus";

const state = reactive({
    refreshing: false,
    clearing: false,
    tabName: "access" as LogCategoryEnum,
});

const accessLogItems = ref<AccessLogItem[]>([]);

const accessPagination = useClientPagination(accessLogItems);

const opLogItems = ref<OperationLogItem[]>([]);

const opPagination = useClientPagination(opLogItems);

const debugLogItems = ref<DebugLogItem[]>([]);

const debugPagination = useClientPagination(debugLogItems);

watch(
    () => state.tabName,
    (tabName) => {
        fetchLogItems(tabName);
    },
    { immediate: true },
);

function fetchLogItems(category: LogCategoryEnum, force = false) {
    let p: Promise<any> | undefined = undefined;
    switch (category) {
        case "access":
            if (force || accessLogItems.value.length === 0) {
                state.refreshing = true;
                p = getLogItems(category).then((res) => {
                    accessLogItems.value = res.data.map((item) => JSON.parse(item));
                });
            }
            break;
        case "operation":
            if (force || opLogItems.value.length === 0) {
                state.refreshing = true;
                p = getLogItems(category).then((res) => {
                    opLogItems.value = res.data.map((item) => JSON.parse(item));
                });
            }
            break;
        case "debug":
            if (force || debugLogItems.value.length === 0) {
                state.refreshing = true;
                p = getLogItems(category).then((res) => {
                    debugLogItems.value = res.data.map((item) => JSON.parse(item));
                });
            }
            break;
    }
    if (p) {
        p.finally(() => {
            state.refreshing = false;
        });
    }
}

function formatter(row: any, col: TableColumnCtx<any>, cellValue: any) {
    if (col.property === "startTime") {
        return formatDate(cellValue);
    } else {
        return cellValue;
    }
}

function clearLog(category: LogCategoryEnum) {
    ElMessageBox.confirm("确认清空日志吗？\n(今天的日志不会被删除)", "警告").then(() => {
        state.refreshing = false;
        clearLogItems(category).finally(() => {
            fetchLogItems(category, true);
        });
    });
}
</script>

<style scoped lang="scss">
@mixin flex_col {
    flex: 1;
    display: flex;
    flex-direction: column;
}
.logManage {
    display: flex;
    flex-direction: column;

    &-header {
        margin-bottom: 10px;
        display: flex;
        justify-content: flex-end;
    }

    :deep(.el-tabs) {
        @include flex_col;
        .el-tabs__content {
            @include flex_col;
        }
        .el-tab-pane {
            @include flex_col;
        }
    }
    :deep(.el-table) {
        flex: 1;
    }
}
</style>
