<template>
    <el-row class="permDemo" :gutter="20">
        <el-col :md="24" :lg="6">
            <el-card header="拥有的权限标识">
                <div class="permDemo-perms">
                    <div class="permDemo-perm" v-for="perm in userStore.userProfile.permCodes" :key="perm">
                        {{ perm }}
                    </div>
                </div>
            </el-card>
        </el-col>
        <el-col :md="24" :lg="18">
            <el-card>
                <template #header>
                    <div class="permDemo-cardHeader">
                        <span>前端权限匹配演示</span>
                        <el-select
                            v-model="selectedPerms"
                            multiple
                            filterable
                            allow-create
                            default-first-option
                            clearable
                            :reserve-keyword="false"
                            placeholder="选择或输入权限代码"
                            class="permDemo-cardHeader-select"
                        >
                            <el-option
                                v-for="perm in userStore.userProfile.permCodes"
                                :key="perm"
                                :label="perm"
                                :value="perm"
                            />
                        </el-select>
                        <el-radio-group v-model="permMode">
                            <el-radio label="every">Every 全部匹配</el-radio>
                            <el-radio label="some">Some 部分匹配</el-radio>
                            <el-radio label="none">None 全不匹配</el-radio>
                        </el-radio-group>
                    </div>
                </template>
                <el-row :gutter="10">
                    <el-col :xl="12">
                        <table class="is-full permDemo-table">
                            <thead>
                                <tr>
                                    <th colspan="2">使用指令：v-has-perm</th>
                                </tr>
                                <tr>
                                    <th class="permDemo-table-col1">指令</th>
                                    <th>结果</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>单个：{{ selectedPerms[0] }}</td>
                                    <td>
                                        <el-tag v-has-perm:[permMode]="selectedPerms[0]">通过</el-tag>
                                    </td>
                                </tr>
                                <tr>
                                    <td>数组：{{ selectedPerms.join(",") }}</td>
                                    <td>
                                        <el-tag v-has-perm:[permMode]="selectedPerms">通过</el-tag>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </el-col>
                    <el-col :xl="12">
                        <table class="is-full permDemo-table">
                            <thead>
                                <tr>
                                    <th colspan="2">使用函数：userStore.hasPerm</th>
                                </tr>
                                <tr>
                                    <th class="permDemo-table-col1">指令</th>
                                    <th>结果</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>单个：{{ selectedPerms[0] }}</td>
                                    <td>
                                        <el-tag v-if="userStore.hasPerm(selectedPerms[0], permMode)">通过</el-tag>
                                    </td>
                                </tr>
                                <tr>
                                    <td>数组：{{ selectedPerms.join(",") }}</td>
                                    <td>
                                        <el-tag v-if="userStore.hasPerm(selectedPerms, permMode)">通过</el-tag>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </el-col>
                </el-row>
            </el-card>

            <el-card style="margin-top: 20px">
                <template #header>
                    <div class="permDemo-cardHeader">
                        <span>后端权限匹配演示</span>
                    </div>
                </template>
                <table class="is-full permDemo-table">
                    <thead>
                        <tr>
                            <th class="permDemo-table-col1">需要的权限</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="test of backendTests" :key="test.code">
                            <td>{{ test.code }}</td>
                            <td>
                                <el-button type="primary" size="small" @click="requestApi(test.url)">测试</el-button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </el-card>
        </el-col>
    </el-row>
</template>

<script setup lang="ts" name="permissionDemo">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { PermMatchMode, PERM_CODES } from "admin-common";
import { useUserStore } from "@/store/modules/user";
import { request } from "@/api/request";

const backendTests = [
    {
        code: PERM_CODES.demoPerm_group_action1,
        url: "/api/demo-permission/action1",
    },
    {
        code: PERM_CODES.demoPerm_group_action2,
        url: "/api/demo-permission/action2",
    },
];

function requestApi(url: string) {
    request({
        method: "GET",
        url,
    }).then(() => {
        ElMessage.success("调用成功！");
    });
}

const userStore = useUserStore();
const permMode = ref<PermMatchMode>("some");
const selectedPerms = ref<string[]>([]);
</script>

<style scoped lang="scss">
.permDemo {
    &-perms {
        overflow: auto;
    }
    &-cardHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        &-select {
            flex: 1;
            margin: 0 20px;
        }
    }
    &-table {
        text-align: center;
        border-collapse: collapse;
        th,
        td {
            border: 1px solid var(--el-border-color);
        }
        &-col1 {
            width: 75%;
        }
    }
}
</style>
