<template>
    <div>
        <p>PageName: ThirdNestedPage2</p>
        <p>Count: {{ count }}</p>
    </div>
</template>

<script setup lang="ts" name="ThirdNestedPage2">
import { ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";

const count = ref(1);

onBeforeRouteLeave((to, from, next) => {
    count.value++;
    next();
});
</script>

<style scoped></style>
