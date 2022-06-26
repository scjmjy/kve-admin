<template>
    <div class="onlineUsers" :gutter="20">
        <el-table class="onlineUsers-table" v-loading="state.refreshing" :data="currentPageData" stripe>
            <el-table-column
                v-for="col of onlineUsersData.columns"
                :label="col.label"
                :prop="col.prop"
                :key="col.prop"
                :formatter="formatter"
                sortable
            >
            </el-table-column>

            <el-table-column label="操作" width="140px" class-name="el-table__column--action">
                <template #default="scope">
                    <el-button type="primary" size="small" plain @click="onForceClick(scope.row)"> 强退 </el-button>
                    <el-dropdown
                        @visible-change="!$event && (scope.row.$__dropdown = false)"
                        @command="onCommand($event, scope.row)"
                    >
                        <span @mouseenter="scope.row.$__dropdown = true">
                            更多
                            <el-icon :class="{ 'is-up': scope.row.$__dropdown, 'el-icon__ani': true }"
                                ><arrow-down
                            /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="ban-ip">禁止IP</el-dropdown-item>
                                <el-dropdown-item command="ban-user">禁止用户</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            class="onlineUsers-pagination"
            small
            background
            layout="total, sizes, prev, pager, next, jumper"
            v-model:page-size="state.pageSize"
            v-model:current-page="state.pageNum"
            :total="onlineUsersData.rows.length"
        />
    </div>
</template>

<script setup lang="ts" name="OnlineUsers">
import { onActivated, reactive, ref } from "vue";
import type { TableColumnCtx } from "element-plus/es/components/table/src/table-column/defaults";
import { OnlineUsersResult } from "admin-common";
import { forceLogout, getOnlineUsers } from "@/api/user";
import { computed } from "@vue/reactivity";
import { formatDate } from "@/utils/date";
import { ElMessage, ElMessageBox } from "element-plus";

const onlineUsersData = ref<OnlineUsersResult>({
    columns: [],
    rows: [],
});

const state = reactive({
    refreshing: false,
    pageNum: 1,
    pageSize: 10,
});

const currentPageData = computed(() => {
    const { pageNum, pageSize } = state;
    return onlineUsersData.value.rows.slice((pageNum - 1) * pageSize, pageNum * pageSize);
});

onActivated(() => {
    onRefreshClick();
});

function onRefreshClick() {
    state.refreshing = true;

    return getOnlineUsers()
        .then((res) => {
            onlineUsersData.value = res.data;
        })
        .finally(() => {
            state.refreshing = false;
        });
}

function formatter(row: any, col: TableColumnCtx<any>, cellValue: any) {
    if (col.property === "loginTime") {
        return formatDate(cellValue);
    } else {
        return cellValue;
    }
}

async function onForceClick(row: Record<string, any>) {
    const msg = `是否强退此会话：\n编号：${row.sessionId}\n用户名：${row.username}`;
    await ElMessageBox.confirm(msg, "警告");
    await forceLogout(row.sessionId);
    const { rows } = onlineUsersData.value;
    const index = rows.findIndex((val) => val === row);
    if (index !== -1) {
        rows.splice(index, 1);
    }
}

function onCommand(command: string, row: Record<string, any>) {
    switch (command) {
        case "ban-ip":
        case "ban-user":
        default:
            ElMessage.warning("暂未实现！");
            break;
    }
}
</script>

<style scoped lang="scss">
.onlineUsers {
    display: flex;
    flex-direction: column;
    &-table {
        flex: 1;
    }
    &-pagination {
        margin-top: 5px;
        justify-content: flex-end;
    }
}
</style>
