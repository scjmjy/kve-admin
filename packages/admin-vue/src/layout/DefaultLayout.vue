<template>
    <el-container class="defaultLayout" :class="layoutClass">
        <el-header class="defaultLayout-header">
            <AppHeader></AppHeader>
        </el-header>
        <el-container style="overflow: hidden">
            <el-aside class="defaultLayout-left">
                <AppMenu></AppMenu>
            </el-aside>
            <el-container class="defaultLayout-right">
                <el-header v-if="systemStore.screen.tags" class="defaultLayout-tags">
                    <TabList></TabList>
                </el-header>

                <el-main class="defaultLayout-main" ref="refMain">
                    <el-scrollbar id="defaultLayoutScrollbar" class="is-vertical">
                        <AppMain pageStyle="flex: 1; padding: 15px;"></AppMain>
                        <AppFooter v-if="route.meta.footer !== false"></AppFooter>
                    </el-scrollbar>
                    <el-backtop target="#defaultLayoutScrollbar .el-scrollbar__wrap" :right="50" :bottom="50" />
                </el-main>
            </el-container>
        </el-container>
    </el-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useSystemStore } from "@/store/modules/system";
import { initAppMainResize } from "@/composables/useAppMainResize";
import AppHeader from "./components/AppHeader.vue";
import AppMenu from "./components/AppMenu.vue";
import AppMain from "./components/AppMain.vue";
import AppFooter from "./components/AppFooter.vue";
import TabList from "./components/TabList.vue";

const systemStore = useSystemStore();

const route = useRoute();

const layoutClass = computed(() => ({
    ["is-menu" + systemStore.menu.mode]: true,
    "is-menuCOLLAPSE": systemStore.menu.collapse,
    ["is-" + systemStore.screen.mode]: true,
}));

const refMain = ref<HTMLDivElement>();
initAppMainResize(refMain);
</script>

<style scoped lang="scss">
$fullWidth: 200px;
$collapseWidth: 64px;
$headerHeight: 48px;
$tagsHeight: 40px;
$footerHeight: 60px;

.defaultLayout {
    height: 100%;
    &-header {
        --el-header-height: #{$headerHeight};
        --el-header-padding: 0 5px 0 0;
        display: flex;
        align-items: center;
        // background: linear-gradient(45deg, rgb(104, 221, 196), rgb(72, 114, 206));
        // background-image: linear-gradient(to right, #f78ca0 0%, #f9748f 19%, #fd868c 60%, #fe9a8b 100%);
    }
    &-left {
        transition: width 0.28s;
        --el-aside-width: #{$fullWidth};
    }
    &-right {
        overflow: hidden;
        background-color: var(--el-bg-color);
        // box-shadow: inset 1px 1px 5px 2px rgb(0 0 0 / 40%);
    }
    &-tags {
        --el-header-height: #{$tagsHeight};
        --el-header-padding: 5px 10px;
        z-index: 100;
        background-color: #4d4b4b;
    }
    &-main {
        position: relative;
        overflow: hidden;
        --el-main-padding: 0;
        :deep(.el-scrollbar) {
            flex: 1;
            .el-scrollbar__view {
                display: flex;
                flex-direction: column;
                // justify-content: flex-end;
                min-height: 100%;
                position: relative;
            }
        }
        display: flex;
    }

    &-footer {
        --el-footer-height: #{$footerHeight};
        --el-footer-padding: 0 0;
    }
    &.is-menuNORMAL {
        &.is-menuCOLLAPSE {
            .defaultLayout-left {
                --el-aside-width: #{$collapseWidth} !important;
            }
        }
    }
    &.is-menuOFFSCREEN {
        .defaultLayout-right {
            flex: none;
            width: 100%;
        }
        &.is-menuCOLLAPSE {
            .defaultLayout-left {
                --el-aside-width: 0 !important;
            }
        }
    }
}
</style>
