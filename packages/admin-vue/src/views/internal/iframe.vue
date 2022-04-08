<template>
    <iframe
        ref="refIFrame"
        :src="(params.url as string)"
        class="iframe"
        frameborder="none"
        @load="onIFrameLoad"
    ></iframe>
</template>

<script setup lang="ts" name="IFramePage">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { useAppMainResize } from "@/composables/useAppMainResize";
const route = useRoute();

const { params } = route;
const refIFrame = ref<HTMLIFrameElement>();

function resetHeight() {
    // TODO 25 是 hardcode 的，可以根据 refIFrame.value!.parentElement 的 padding 值来计算
    // const height = refIFrame.value!.parentElement!.clientHeight - 25;
    // refIFrame.value!.style.setProperty("height", `${height}px`);
    // console.log("[height]", height);
}

onMounted(() => {
    resetHeight();
});
useAppMainResize(() => {
    resetHeight();
});

function onIFrameLoad() {}
</script>

<style scoped lang="scss">
.iframe {
    width: 100%;
}
</style>
