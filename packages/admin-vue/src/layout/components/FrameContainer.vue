<template>
    <transition-group v-show="isShow" class="frameMain" ref="refMain" name="transition-3d" mode="out-in" tag="div">
        <template v-for="frame of iframes" :key="frame.fullPath">
            <iframe
                v-show="frame.name === route.name"
                :src="frame.meta.iframe"
                class="frameMain-iframe"
                frameborder="none"
                :height="frameHeight"
            ></iframe>
        </template>
    </transition-group>
    <!-- <div v-show="isShow" class="frameMain" ref="refMain">
        <template v-for="frame of iframes" :key="frame.fullPath">
            <iframe
                v-show="frame.name === route.name"
                :src="frame.meta.iframe"
                class="frameMain-iframe"
                frameborder="none"
                :height="frameHeight"
            ></iframe>
        </template>
    </div> -->
</template>

<script setup lang="ts">
import { ComponentPublicInstance, computed, onMounted, ref } from "vue";
import { useSystemStore } from "@/store/modules/system";
import { useRoute } from "vue-router";
import { useAppMainResize } from "@/composables/useAppMainResize";
const route = useRoute();
const systemStore = useSystemStore();
const iframes = computed(() => {
    return systemStore.router.visitedRoutes.filter((route) => route.meta.iframe);
});
const isShow = computed(() => {
    return iframes.value.length && iframes.value.find((frame) => frame.name === route.name);
});
const frameHeight = ref(0);
const refMain = ref<ComponentPublicInstance>();
function resetHeight() {
    if (refMain.value && refMain.value.$el && isShow.value) {
        frameHeight.value = refMain.value.$el.clientHeight;
    }
}
// const refMain = ref<HTMLDivElement>();
// function resetHeight() {
//     if (refMain.value && isShow.value) {
//         frameHeight.value = refMain.value.clientHeight;
//     }
// }
onMounted(() => {
    resetHeight();
});
useAppMainResize(() => {
    resetHeight();
});
</script>

<style scoped lang="scss">
.frameMain {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    margin: var(--el-main-padding);
    &-iframe {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        width: 100%;
    }
}
</style>
