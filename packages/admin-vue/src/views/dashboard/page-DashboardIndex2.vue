<template>
    <div class="indexPage2">
        <EchartsGeoMap class="indexPage2-map" />
    </div>
</template>

<script setup lang="ts" name="DashboardIndex2">
import EchartsGeoMap from "./components/EchartsGeoMap.vue";
</script>

<style scoped lang="scss">
.indexPage2 {
    display: flex;
    flex-direction: column;
    &-map {
        flex: 1;
    }
}
</style>
