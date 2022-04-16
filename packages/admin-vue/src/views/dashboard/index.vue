<template>
    <div class="indexPage">
        <p>RouteName: Index1</p>
        <p>此页面进入次数: {{ count }}</p>
        <div>
            <img v-for="index in 20" :key="index" :src="'https://picsum.photos/400/400?random=' + index" alt="" />
        </div>
    </div>
</template>

<script setup lang="ts" name="Index1">
import { onActivated, ref } from "vue";

const count = ref(0);

onActivated(() => {
    count.value++;
});
</script>

<style scoped lang="scss">
.indexPage {
    img {
        margin: 10px;
        width: calc(50% - 20px);
    }
}
</style>
