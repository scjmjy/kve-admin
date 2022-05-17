<template>
    <div>
        <p>PageName: ThirdNestedPage1Detail</p>
        <p>Count: {{ count }}</p>
        <p>参数：{{ params }}</p>
    </div>
</template>

<script setup lang="ts" name="ThirdNestedPageDetail1">
import { onActivated, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
// 不需要使用 computed 来动态计算 query，只记录此页面起初的 query
const { params } = route;

const count = ref(0);
onActivated(() => {
    count.value++;
});
</script>

<style scoped></style>
