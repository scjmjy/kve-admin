<template>
    <el-container
        class="defaultLayout"
        :class="{
            ['is-menu' + systemStore.menu.mode]: true,
            'is-menuCOLLAPSE': systemStore.menu.collapse,
            'is-menuEXPAND': !systemStore.menu.collapse,
            ['is-' + systemStore.screen.mode]: true,
            'has-footer': systemStore.screen.footer,
            'has-tags': systemStore.screen.tags,
        }"
    >
        <el-header class="defaultLayout-header">
            <AppHeader></AppHeader>
        </el-header>
        <el-container style="overflow: hidden">
            <el-aside class="defaultLayout-left" width="240px">
                <AppMenu></AppMenu>
            </el-aside>
            <el-container class="defaultLayout-right">
                <el-header v-if="systemStore.screen.tags" class="defaultLayout-tags">
                    <TabList></TabList>
                </el-header>

                <el-main class="defaultLayout-main" ref="refMain">
                    <AppMain></AppMain>
                </el-main>
                <el-footer v-if="systemStore.screen.footer" class="defaultLayout-footer">
                    <AppFooter></AppFooter>
                </el-footer>
            </el-container>
        </el-container>
    </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useSystemStore } from "@/store/modules/system";
import { initAppMainResize } from "@/composables/useAppMainResize";
import AppHeader from "./components/AppHeader.vue";
import AppMenu from "./components/AppMenu.vue";
import AppMain from "./components/AppMain.vue";
import AppFooter from "./components/AppFooter.vue";
import TabList from "./components/TabList.vue";

const systemStore = useSystemStore();

const refMain = ref<HTMLDivElement>()
initAppMainResize(refMain);

</script>

<style scoped lang="scss">
$fullWidth: 240px;
$collapseWidth: 84px;
$headerHeight: 48px;
$tagsHeight: 40px;
$footerHeight: 60px;

.defaultLayout {
    height: 100%;
    &-header {
        --el-header-height: #{$headerHeight};
        --el-header-padding: 0 20px 0 0px;
        display: flex;
        align-items: center;
        padding-right: 20px;
        // background: linear-gradient(45deg, rgb(104, 221, 196), rgb(72, 114, 206));
    }
    &-left {
        transition: width 0.28s;
    }
    &-right {
        overflow-x: hidden;
        overflow-y: auto;
        background-color: var(--el-bg-color);
        // box-shadow: inset 1px 1px 5px 2px rgb(0 0 0 / 40%);
        .has-footer & {
            display: block;
        }
    }
    &-tags {
        --el-header-height: #{$tagsHeight};
        --el-header-padding: 5px 10px;
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        background-color: #4d4b4b;
        z-index: 100;
    }
    &-main {
        position: relative;
        overflow-x: hidden;
        overflow-y: auto;
        --el-main-padding: 10px;
        .has-footer.has-tags & {
            min-height: calc(100% - #{$footerHeight} - #{$tagsHeight});
        }
        .has-footer:not(.has-tags) & {
            min-height: calc(100% - #{$headerHeight});
        }
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
        // &.is-menuEXPAND {
        //     .defaultLayout-right {
        //         flex: none;
        //         width: calc(100% - #{$collapseWidth});
        //     }
        // }
    }
    &.is-menuOFFSCREEN {
        &.is-menuCOLLAPSE {
            .defaultLayout-left {
                --el-aside-width: 0 !important;
            }
        }
        &.is-menuEXPAND {
            .defaultLayout-left {
                --el-aside-width: #{$fullWidth} !important;
            }
            .defaultLayout-right {
                flex: none;
                width: 100%;
            }
        }
    }
}
</style>
