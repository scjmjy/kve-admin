<template>
    <div>
        <p>RouteName: Page1Detail</p>
        <p>此页面进入次数: {{ count }}</p>
        <p>此页面的 Query: {{ query }}</p>
    </div>
</template>

<script setup lang="ts" name="Page1Detail">
import { onActivated, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
// 不需要使用 computed 来动态计算 query，只记录此页面起初的 query
const { query } = route;

const count = ref(0);
onActivated(() => {
    count.value++;
});

const inputValue = ref("");
</script>

<style scoped></style>
