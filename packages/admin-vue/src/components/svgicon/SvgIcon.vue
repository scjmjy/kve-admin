<template>
    <template v-if="icon">
        <el-icon v-if="icon.startsWith('icon-')" :color="color" :size="size">
            <svg aria-hidden="true">
                <use :xlink:href="'#' + icon" />
            </svg>
        </el-icon>
        <el-icon v-else :color="color" :size="size">
            <component :is="icon"></component>
        </el-icon>
    </template>
</template>

<script setup lang="ts">
defineProps({
    icon: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        default: "currentColor",
    },
    size: {
        type: [String, Number],
        default: undefined,
    },
});
</script>

<style lang="scss"></style>
