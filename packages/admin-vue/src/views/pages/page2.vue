<template>
    <div>
        <p>RouteName: Page2</p>
        <p>此页面进入次数: {{ count }}</p>
        <div>
            <div>演示功能:</div>
            <ul>
                <li>使用 route.meta.cacheable=false 来禁用缓存</li>
                <li>“此页面进入次数”始终是 1</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts" name="Page2">
import { onBeforeMount, onBeforeUnmount, ref } from "vue";

const count = ref(0);

onBeforeMount(() => {
    count.value++;
});
onBeforeUnmount(() => {
    count.value--;
});
</script>

<style scoped></style>
