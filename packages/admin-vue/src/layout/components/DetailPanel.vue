<template>
    <div id="defaultLayoutDetailPanel">
        
    </div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from "vue";

const instance = getCurrentInstance();
console.log(instance);

</script>

<style scoped lang="scss">
$detailPanelWidth: 300px;
#defaultLayoutDetailPanel {
    width: $detailPanelWidth;
    background-color: aqua;
}
</style>
