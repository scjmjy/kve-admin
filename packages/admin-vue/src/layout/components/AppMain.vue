<template>
    <router-view v-slot="{ Component, route }">
        <transition name="transition-3d" mode="out-in">
            <keep-alive :include="systemStore.router.cachedTabs.join(',')">
                <component :is="Component" :key="route.fullPath" />
            </keep-alive>
        </transition>
    </router-view>
    <transition name="transition-3d" mode="out-in">
        <FrameContainer></FrameContainer>
    </transition>
</template>

<script setup lang="ts">
import { useSystemStore } from "@/store/modules/system";
import FrameContainer from "./FrameContainer.vue";

const systemStore = useSystemStore();
</script>

<style scoped></style>
