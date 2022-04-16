<template>
    <template v-if="!(route.meta && route.meta.visible === false)">
        <template v-if="route.children && route.children.length">
            <el-sub-menu
                :class="'menuItem menuItem-' + depth"
                :index="route.path"
                popper-append-to-body
                popper-class="appMenu"
            >
                <template #title>
                    <SvgIcon :icon="route.meta?.icon"></SvgIcon>
                    <span class="appMenu-title">{{ route.meta?.title }}</span>
                </template>
                <MenuItem
                    v-for="item in route.children"
                    :key="item.path"
                    :route="item"
                    :depth="depth + 1"
                    :for-route="forRoute"
                >
                </MenuItem>
            </el-sub-menu>
        </template>
        <template v-else>
            <el-menu-item
                :index="route.path"
                :class="{ 'has-detail': forRoute === route.path }"
                @click="onMenuItemClick"
            >
                <SvgIcon :icon="route.meta?.icon"></SvgIcon>
                <template #title>
                    <span class="appMenu-title">{{ route.meta?.title }}</span>
                </template>
            </el-menu-item>
        </template>
    </template>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { MenuItemRegistered } from "element-plus";
import { RouteRecordMenuItem } from "@/router/utils";
import { isExternalLink } from "@/utils/is";
import { useRouter } from "vue-router";
import { useSystemStore } from "@/store/modules/system";

const props = defineProps({
    forRoute: {
        type: String,
        default: "",
    },
    route: {
        type: Object as PropType<RouteRecordMenuItem>,
        required: true,
    },
    depth: {
        type: Number,
        default: 1,
    },
});

const router = useRouter();
const systemStore = useSystemStore();

function onMenuItemClick(item: MenuItemRegistered) {
    const { index: path } = item;
    if (isExternalLink(path)) {
        window.open(path, "_blank");
    } else if (props.route.meta?.iframe) {
        router.push(path);
    } else {
        router.push(path);
    }

    if (systemStore.menu.mode === "OFFSCREEN") {
        systemStore.menu.collapse = true;
    }
}
</script>
