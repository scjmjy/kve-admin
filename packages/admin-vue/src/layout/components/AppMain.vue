<template>
    <router-view v-slot="{ Component, route }">
        <transition name="transition-3d" mode="out-in">
            <keep-alive :include="cachedRoutes">
                <component :style="pageStyle" :is="Component" :key="route.fullPath" />
            </keep-alive>
        </transition>
    </router-view>
    <transition v-if="systemStore.settings.iframe" name="transition-3d" mode="out-in">
        <FrameContainer></FrameContainer>
    </transition>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSystemStore } from "@/store/modules/system";
import FrameContainer from "./FrameContainer.vue";

defineProps({
    pageStyle: String,
});

const systemStore = useSystemStore();
const cachedRoutes = computed(() => {
    // 因为 cachedTabs.slice() 无法触发组件的 onUnmounted, 所以使用 string 类型；
    // NO-ROUTES-TO-CACHE 是 hardcoded，目的是为了不匹配任意的路由，所以你的 route.name 不能等于 NO-ROUTES-TO-CACHE
    return systemStore.router.cachedTabs.join(",") || "NO-ROUTES-TO-CACHE";
});
</script>

<style scoped></style>
