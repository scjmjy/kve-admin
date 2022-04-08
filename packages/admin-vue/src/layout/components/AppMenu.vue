<template>
    <el-scrollbar class="is-vertical appMenu" v-click-outside:[elHamburger]="onClickOutside">
        <el-menu
            :default-active="defaultActive"
            :collapse="systemStore.menu.collapse"
            :collapse-transition="false"
            @mouseenter="onMouseEnter"
            @mouseleave="onMouseLeave"
            @select="onMenuItemSelected"
        >
            <template v-for="route in systemStore.router.fullpathRoutes" :key="route.path">
                <el-menu-item-group v-if="!(route.meta && route.meta.visible === false)" :title="route.meta?.title">
                    <template v-if="route.children && route.children.length">
                        <MenuItem
                            v-for="(item, index) in route.children"
                            :key="item.path"
                            :route="item"
                            :for-route="forRoute"
                        ></MenuItem>
                    </template>
                    <template v-else>
                        <MenuItem :route="route" :for-route="forRoute"></MenuItem>
                    </template>
                </el-menu-item-group>
            </template>
        </el-menu>
    </el-scrollbar>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useSystemStore } from "@/store/modules/system";
import { useRoute } from "vue-router";
import MenuItem from "./MenuItem.vue";
import { isExternalLink } from "@/utils/is";
import { findRouteFullpath } from "@/router/routes";

const route = useRoute();
const systemStore = useSystemStore();
const defaultActive = ref("");
const forRoute = ref("");

watch(
    () => route.path,
    (path) => {
        const { forName } = route.meta || {};
        if (forName) {
            forRoute.value = defaultActive.value = findRouteFullpath(forName);
        } else {
            defaultActive.value = path;
            forRoute.value = "";
        }
    },
    {
        immediate: true,
    },
);

let restoreMenuCollapse = false;

function onMouseEnter() {
    if (systemStore.menu.collapse) {
        systemStore.menu.collapse = false;
        restoreMenuCollapse = true;
    }
}

function onMouseLeave() {
    if (restoreMenuCollapse) {
        systemStore.menu.collapse = true;
        restoreMenuCollapse = false;
    }
}

function onClickOutside() {
    if (systemStore.menu.mode === "OFFSCREEN") {
        systemStore.menu.collapse = true;
    }
}

function onMenuItemSelected(index: string) {
    if (isExternalLink(index)) {
        defaultActive.value = "";
        setTimeout(() => {
            defaultActive.value = route.path;
        }, 100);
    }
}

const elHamburger = ref<HTMLElement | null>();
onMounted(() => {
    elHamburger.value = document.getElementById("appHeader-hamburger");
});
</script>

<style lang="scss">
$menuItemPadding: 0 10px !important;
$menuItemMargin: 0px 8px 5px !important;
$menuItemMarginCollapse: 0px 0px 5px !important;
$menuItemBgDark: rgba(255, 255, 255, 0.3);
$menuItemBgLight: rgba(255, 255, 255, 0.12);
.appMenu {
    padding: 20px 0;
    box-sizing: border-box;
    z-index: 100;
    background: left/cover linear-gradient(to right, #141e30d4, #243b55c7),
        no-repeat left/cover url(@/assets/imgs/bg-menu.jpg);

    .el-menu {
        --el-menu-active-color: white;
        --el-menu-item-height: 48px;
        margin: 0 auto;
        border-right: none !important;
        background-color: transparent;
        &--inline {
            margin-left: 30px;
            &::before {
                background-color: #90939970;
                position: absolute;
                width: 3px;
                height: 100%;
                left: 0px;
                content: " ";
                z-index: 100;
            }
        }
        &-item {
            margin: $menuItemMarginCollapse;
            min-width: unset !important;
            border-radius: 6px;
            padding: $menuItemPadding;
            color: white;
            &.is-active {
                background-color: $menuItemBgDark;
                &.has-detail {
                    background-color: $menuItemBgLight;
                }
            }
            &:hover {
                background-color: $menuItemBgDark !important;
            }
        }
        &:not(.el-menu--collapse) {
            .el-menu-item {
                margin: $menuItemMargin;
            }
        }
        .el-menu-item-group__title {
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            font-size: 16px;
            font-weight: bold;
        }
        &.el-menu--collapse {
            .el-menu-item-group {
                border-top: 2px solid rgba(255, 255, 255, 0.3);
                padding: 5px 0;
            }
        }
    }
    .el-sub-menu {
        .el-menu-item {
            height: var(--el-menu-item-height);
            line-height: var(--el-menu-item-height);
        }
        &__title {
            border-radius: 6px;
            color: white;
            &:hover {
                background-color: $menuItemBgDark !important;
            }
        }
        &.is-active:not(.is-opened) {
            > .el-sub-menu__title {
                background-color: $menuItemBgLight;
            }
        }
    }

    .el-menu:not(.el-menu--collapse) {
        .el-sub-menu__title {
            margin: $menuItemMargin;
            padding: $menuItemPadding;
        }
    }

    .menuItem-2 {
        .el-menu--inline {
            &::before {
                width: 1.5px;
            }
        }
    }
    .menuItem-3 {
        .el-menu--inline {
            &::before {
                width: 1px;
            }
        }
    }
}
</style>
