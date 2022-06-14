<template>
    <Hamburger v-model="systemStore.menu.collapse" id="appHeader-hamburger" @change="onHamburgerChange"></Hamburger>
    <img class="appHeader-logo" src="@/assets/imgs/logo.png" />
    <span class="appHeader-title">KVE 全栈后台管理系统</span>
    <div class="appHeader-right">
        <el-link type="primary" @click="state.showPayDlg = true" style="margin-right: 10px">购买源码</el-link>
        <el-switch v-model="isDark" style="margin-right: 24px" inline-prompt active-icon="Moon" inactive-icon="Sunny" />
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
    <el-dialog v-model="state.showPayDlg" title="购买源码流程">
        <div>
            <ol>
                <li>添加作者微信好友</li>
                <li>支付金额： <strong>129</strong>元</li>
                <li>把你的 github 账号名称告知作者</li>
                <li>作者把你的 github 账号设置为此项目的协作者</li>
                <li>拉取代码： <code>git clone https://github.com/scjmjy/kve-admin.git</code></li>
                <li>加入QQ交流群</li>
            </ol>
            <div style="display: flex; justify-content: space-between; height: 300px">
                <img style="overflow: hidden" src="@/assets/imgs/kve/WX.jpg" />

                <img style="overflow: hidden" src="@/assets/imgs/kve/QQ-KVE-1.png" />
            </div>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import { useSystemStore } from "@/store/modules/system";
import Hamburger from "@/components/Hamburger.vue";
import ProfileCard from "./ProfileCard.vue";

const isDark = useDark();

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
