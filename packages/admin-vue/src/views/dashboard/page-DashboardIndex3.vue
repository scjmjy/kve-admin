<template>
    <div class="indexPage3">
        <EchartsAMapBusLines class="indexPage3-map" />
    </div>
</template>

<script setup lang="ts" name="DashboardIndex3">
import EchartsAMapBusLines from "./components/EchartsAMapBusLines.vue";
</script>

<style scoped lang="scss">
.indexPage3 {
    display: flex;
    flex-direction: column;
    &-map {
        flex: 1;
    }
}
</style>
