<template>
    <transition-group v-show="isShow" class="frameContainer" ref="refMain" name="transition-3d" mode="out-in" tag="div">
        <template v-for="frame of systemStore.iframes" :key="frame.fullPath">
            <iframe
                v-show="frame.name === route.name"
                :src="frame.meta.iframe"
                class="frameContainer-iframe"
                frameborder="none"
                :height="frameHeight"
            ></iframe>
        </template>
    </transition-group>
    <!-- <div v-show="isShow" class="frameContainer" ref="refMain">
        <template v-for="frame of iframes" :key="frame.fullPath">
            <iframe
                v-show="frame.name === route.name"
                :src="frame.meta.iframe"
                class="frameContainer-iframe"
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
const isShow = computed(() => {
    return systemStore.iframes.length > 0 && !!systemStore.iframes.find((frame) => frame.name === route.name);
});
/**
 * TODO 这里是 hardcoded，可以在 systemStore 里配置 headerHeight 和 tagsHeight
 * headerHeight: 48
 * tagsHeight: 40 */
function calcFrameHeight() {
    return window.innerHeight - 48 - 40;
}
const frameHeight = ref(calcFrameHeight());
const refMain = ref<ComponentPublicInstance>();
function resetHeight() {
    frameHeight.value = calcFrameHeight();
    // if (refMain.value && refMain.value.$el && isShow.value) {
    //     frameHeight.value = refMain.value.$el.clientHeight;
    // }
}
// const refMain = ref<HTMLDivElement>();
// function resetHeight() {
//     if (refMain.value && isShow.value) {
//         frameHeight.value = refMain.value.clientHeight;
//     }
// }
onMounted(() => {
    // resetHeight();
});
useAppMainResize(() => {
    resetHeight();
});
</script>

<style scoped lang="scss">
.frameContainer {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    // margin: var(--el-main-padding);
    &-iframe {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        width: 100%;
    }
}
</style>
