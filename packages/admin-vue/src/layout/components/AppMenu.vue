<template>
    <el-scrollbar class="appMenu" v-click-outside:[elHamburger]="onClickOutside">
        <el-menu
            :default-active="defaultActive"
            :collapse="systemStore.menu.collapse"
            :collapse-transition="false"
            router
            @mouseenter="onMouseEnter"
            @mouseleave="onMouseLeave"
        >
            <el-menu-item-group
                v-for="route in systemStore.router.allRoutes"
                :key="route.path"
                :title="route.meta?.title"
            >
                <template v-if="route.children && route.children.length">
                    <MenuItem v-for="(item, index) in route.children" :key="item.path" :route="item"></MenuItem>
                </template>
                <template v-else>
                    <MenuItem :route="route"></MenuItem>
                </template>
            </el-menu-item-group>
        </el-menu>
    </el-scrollbar>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useSystemStore } from "@/store/modules/system";
import { useRouter } from "vue-router";
import MenuItem from "./MenuItem.vue";

const router = useRouter();
const systemStore = useSystemStore();
const defaultActive = router.currentRoute.value.fullPath;
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
    console.log(arguments);

    if (systemStore.menu.mode === "OFFSCREEN") {
        systemStore.menu.collapse = true;
    }
}
const elHamburger = ref<HTMLElement | null>();
onMounted(() => {
    elHamburger.value = document.getElementById("appHeader-hamburger");
});
</script>

<style lang="scss">
$menuItemPadding: 0 10px !important;
$menuItemMargin: 0 5px 0 10px !important;
.appMenu {
    padding: 20px 0;
    box-sizing: border-box;
    z-index: 100;
    background: left/cover linear-gradient(to right, #141e30d4, #243b55c7),
        no-repeat left/cover url(@/assets/imgs/bg-menu.jpg);

    .el-menu {
        margin: 0 auto;
        --el-menu-active-color: white;
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
            min-width: unset !important;
            border-radius: 6px;
            padding: $menuItemPadding;
            color: white;
            &:hover,
            &.is-active {
                background-color: rgba(255, 255, 255, 0.3);
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
        &__title {
            border-radius: 6px;
            color: white;
            &:hover {
                background-color: rgba(255, 255, 255, 0.3) !important;
            }
        }
        &.is-active:not(.is-opened) {
            > .el-sub-menu__title {
                background-color: rgba(255, 255, 255, 0.15);
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

    &.el-popper {
        border: none !important;
        box-shadow: 0 5px 5px 0px #808080b3;
    }
}
</style>
