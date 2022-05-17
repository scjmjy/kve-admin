<template>
    <el-card class="profileCard" shadow="never">
        <template #header>
            <span>{{ userStore.userProfile.realname }}</span>
            <el-button class="button" type="danger" :loading="state.loggingOut" @click="logout">退出</el-button>
        </template>
        <div>
            <el-link type="primary" @click="gotoProfile">更多...</el-link>
        </div>
    </el-card>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useUserStore } from "@/store/modules/user";
import { useRouter } from "vue-router";

const emit = defineEmits(["hideme"]);

const router = useRouter();
const userStore = useUserStore();

const state = reactive({
    loggingOut: false,
    isProfileCardShow: false,
});
function logout() {
    state.loggingOut = true;
    emit("hideme");
    userStore.logout().finally(() => {});
}
function gotoProfile() {
    router.push("/user/profile");
    emit("hideme");
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
