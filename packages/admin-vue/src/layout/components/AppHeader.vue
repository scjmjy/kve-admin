<template>
    <Hamburger v-model="systemStore.menu.collapse" id="appHeader-hamburger" @change="onHamburgerChange"></Hamburger>
    <img class="appHeader-logo" src="@/assets/imgs/logo.png" />
    <span class="appHeader-title">KVE 后台管理系统</span>
    <el-popover
        placement="bottom-end"
        :width="240"
        trigger="hover"
        @before-enter="toggleProfileCardShow"
        @before-leave="toggleProfileCardShow"
    >
        <template #reference>
            <div class="appHeader-right" ref="refPopoverTrigger">
                <UserAvatar class="appHeader-avatar"></UserAvatar>
                <el-icon :class="{ 'is-up': state.isProfileCardShow, 'el-icon__ani': true }"><arrow-down /></el-icon>
            </div>
        </template>
        <ProfileCard @hideme="onHideme"></ProfileCard>
    </el-popover>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useSystemStore } from "@/store/modules/system";
import Hamburger from "@/components/Hamburger.vue";
import ProfileCard from "./ProfileCard.vue";

const systemStore = useSystemStore();

const state = reactive({
    isProfileCardShow: false,
});

function onHamburgerChange(collapse: boolean) {
    systemStore.menu.collapse = collapse;
}
function toggleProfileCardShow() {
    state.isProfileCardShow = !state.isProfileCardShow;
}
const refPopoverTrigger = ref<HTMLDivElement>();
function onHideme() {
    const mouseEvent = new MouseEvent("mouseleave");
    refPopoverTrigger.value?.dispatchEvent(mouseEvent);
}
</script>

<style scoped lang="scss">
.appHeader {
    &-logo {
        height: 100%;
    }
    &-title {
        margin-left: 10px;
        font-weight: bold;
        font-size: 1.4em;
        color: var(--el-color-primary);
        // .is-xs & {
        //     display: none;
        // }
    }
    &-right {
        margin-left: auto;
        display: flex;
        align-items: center;
    }
    &-avatar {
        margin-right: 4px;
    }
}
</style>
