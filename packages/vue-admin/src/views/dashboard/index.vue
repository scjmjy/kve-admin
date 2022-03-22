<template>
    <div class="dashboardIndex">
        <div>Dashboard</div>
        <el-button type="primary" @click="logout">退出</el-button>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();

function logout() {
    userStore.logout().finally(() => {});
}
</script>

<style scoped lang="scss">
.dashboardIndex {
    height: 100%;
    background-color: grey;
}
</style>
