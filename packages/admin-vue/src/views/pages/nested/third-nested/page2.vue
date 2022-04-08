<template>
    <div>
        <p>RouteName: ThirdNestedPage2</p>
        <p>此页面进入次数: {{ count }}</p>
    </div>
</template>

<script setup lang="ts" name="ThirdNestedPage2">
import { onActivated, ref } from "vue";

const count = ref(0);

onActivated(() => {
    count.value++;
});
</script>

<style scoped></style>
