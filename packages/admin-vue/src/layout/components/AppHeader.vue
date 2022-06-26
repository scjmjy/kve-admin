<template>
    <Hamburger v-model="systemStore.menu.collapse" id="appHeader-hamburger" @change="onHamburgerChange"></Hamburger>
    <img class="appHeader-logo" src="@/assets/imgs/logo.png" />
    <span class="appHeader-title">KVE 全栈后台管理系统</span>
    <div class="appHeader-right">
        <el-link
            type="primary"
            target="_blank"
            href="https://github.com/scjmjy/kve-admin.git"
            style="margin-right: 12px"
        >
            <SvgIcon icon="icon-github" :size="24" color="var(--el-text-color-primary)"></SvgIcon>
        </el-link>
        <el-switch
            v-model="isDark"
            style="margin-right: 12px"
            inline-prompt
            active-icon="Moon"
            inactive-icon="Sunny"
            @change="onThemeChange"
        />
        <el-popover
            placement="bottom-end"
            :width="240"
            trigger="hover"
            @before-enter="toggleProfileCardShow"
            @before-leave="toggleProfileCardShow"
        >
            <template #reference>
                <div ref="refPopoverTrigger" class="is-flex is-vCenter">
                    <UserAvatar class="appHeader-avatar"></UserAvatar>
                    <el-icon :class="{ 'is-up': state.isProfileCardShow, 'el-icon__ani': true }"
                        ><arrow-down
                    /></el-icon>
                </div>
            </template>
            <ProfileCard @hideme="onHideme"></ProfileCard>
        </el-popover>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { useSystemStore } from "@/store/modules/system";
import Hamburger from "@/components/Hamburger.vue";
import ProfileCard from "./ProfileCard.vue";
import { emitter } from "@/utils/event";
import { useDarkMode } from "@/composables/useDarkMode";

const { isDark } = useDarkMode();

function onThemeChange(dark: string | number | boolean) {
    emitter.emit("theme-dark", dark as boolean);
}

const systemStore = useSystemStore();

const state = reactive({
    isProfileCardShow: false,
    showPayDlg: false,
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
        .is-xs & {
            display: none;
        }
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
