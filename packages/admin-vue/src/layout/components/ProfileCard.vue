<template>
    <el-card class="profileCard" shadow="never">
        <template #header>
            <span>User Name</span>
            <el-button class="button" type="primary" :loading="state.loggingOut" @click="logout">退出</el-button>
        </template>
        <div v-for="o in 4" :key="o" class="text item">{{ "List item " + o }}</div>
    </el-card>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useUserStore } from "@/store/modules/user";

const userStore = useUserStore();

const state = reactive({
    loggingOut: false,
    isProfileCardShow: false,
});
function logout() {
    state.loggingOut = true;
    userStore.logout().finally(() => {});
}
</script>

<style scoped></style>

<style lang="scss">
.profileCard {
    .el-card__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}
</style>
