<template>
    <template v-if="route.children && route.children.length">
        <el-sub-menu :class="'menuItem menuItem-' + depth" :index="route.path" popper-append-to-body popper-class="appMenu">
            <template #title>
                <el-icon>
                    <edit></edit>
                </el-icon>
                <span class="appMenu-title">{{ route.meta?.title }}</span>
            </template>
            <MenuItem v-for="item in route.children" :key="item.path" :route="item" :depth="depth + 1"> </MenuItem>
        </el-sub-menu>
    </template>
    <template v-else>
        <el-menu-item :index="route.path">
            <el-icon>
                <edit></edit>
            </el-icon>
            <template #title>
                <span class="appMenu-title">{{ route.meta?.title }}</span>
            </template>
        </el-menu-item>
    </template>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { RouteRecordMenuItem } from "@/router/utils";

const props = defineProps({
    route: {
        type: Object as PropType<RouteRecordMenuItem>,
        required: true,
    },
    depth: {
        type: Number,
        default: 1,
    },
});
</script>
