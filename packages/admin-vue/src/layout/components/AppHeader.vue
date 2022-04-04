<template>
    <div class="appHeader">
        <Hamburger v-model="systemStore.menu.collapse" id="appHeader-hamburger" @change="onHamburgerChange"></Hamburger>
        <span class="appHeader-title">方舟后台管理系统</span>
        <el-popover
            placement="bottom-end"
            :width="300"
            trigger="hover"
            @before-enter="toggleProfileCardShow"
            @before-leave="toggleProfileCardShow"
        >
            <template #reference>
                <div class="m-flex is-vCenter">
                    <el-avatar class="appHeader-avatar"></el-avatar>
                    <el-icon :class="{ 'is-up': state.isProfileCardShow, 'el-icon__ani': true }"
                        ><arrow-down
                    /></el-icon>
                </div>
            </template>
            <el-card class="appHeader-profileCard" shadow="never">
                <template #header>
                    <span>User Name</span>
                    <el-button class="button" type="primary" :loading="state.loggingOut" @click="logout"
                        >退出</el-button
                    >
                </template>
                <div v-for="o in 4" :key="o" class="text item">{{ "List item " + o }}</div>
            </el-card>
        </el-popover>
    </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import Hamburger from "@/components/Hamburger.vue";
import { useSystemStore } from "@/store/modules/system";
import { useUserStore } from "@/store/modules/user";

const systemStore = useSystemStore();

const userStore = useUserStore();

const state = reactive({
    loggingOut: false,
    isProfileCardShow: false,
});

function logout() {
    state.loggingOut = true;
    userStore.logout().finally(() => {});
}

function onHamburgerChange(collapse: boolean) {
    systemStore.menu.collapse = collapse;
}
function toggleProfileCardShow() {
    state.isProfileCardShow = !state.isProfileCardShow;
}
</script>

<style scoped lang="scss">
.appHeader {
    height: 100%;
    display: flex;
    align-items: center;
    padding-right: 20px;
    background: linear-gradient(45deg, rgb(104, 221, 196), rgb(72, 114, 206));
    box-shadow: 0 0.46875rem 2.1875rem rgba(8, 10, 37, 0.03), 0 0.9375rem 1.40625rem rgba(8, 10, 37, 0.03),
        0 0.25rem 0.53125rem rgba(8, 10, 37, 0.05), 0 0.125rem 0.1875rem rgba(8, 10, 37, 0.03);

    &-title {
        margin-right: auto;
        font-weight: bold;
        font-size: 1.4em;
        color: var(--el-color-primary);
    }
    &-avatar {
        margin-right: 4px;
    }
}
</style>

<style lang="scss">
.appHeader {
    &-profileCard {
        .el-card__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }
}
</style>
