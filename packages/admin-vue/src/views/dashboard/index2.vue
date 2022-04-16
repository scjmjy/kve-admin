<template>
    <div class="index2Page">
        <p>RouteName: Index2</p>
        <p>此页面进入次数: {{ count }}</p>
        <div>
            <img v-for="index in 10" :key="index" :src="'https://picsum.photos/200/300?random=' + index" alt="" />
        </div>
    </div>
</template>

<script setup lang="ts" name="Index2">
import { onActivated, ref } from "vue";

const count = ref(0);

onActivated(() => {
    count.value++;
});
</script>

<style scoped lang="scss">

.index2Page {
    img {
        margin: 10px;
        width: calc(50% - 20px);
    }
}
</style>
