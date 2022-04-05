<template>
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
                <el-avatar class="appHeader-avatar" src="/static/img/男孩.png"></el-avatar>
                <el-icon :class="{ 'is-up': state.isProfileCardShow, 'el-icon__ani': true }"><arrow-down /></el-icon>
            </div>
        </template>
        <el-card class="appHeader-profileCard" shadow="never">
            <template #header>
                <span>User Name</span>
                <el-button class="button" type="primary" :loading="state.loggingOut" @click="logout">退出</el-button>
            </template>
            <div v-for="o in 4" :key="o" class="text item">{{ "List item " + o }}</div>
        </el-card>
    </el-popover>
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
