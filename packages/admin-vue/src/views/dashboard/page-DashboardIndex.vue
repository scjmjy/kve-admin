<template>
    <div class="indexPage">
        <EchartsAMap class="indexPage-map" />
    </div>
</template>

<script setup lang="ts" name="DashboardIndex">
import { onActivated, ref } from "vue";
import EchartsAMap from "./components/EchartsAMap.vue";

const count = ref(0);

onActivated(() => {
    count.value++;
});
</script>

<style scoped lang="scss">
.indexPage {
    display: flex;
    flex-direction: column;
    &-map {
        flex: 1;
    }
}
</style>
