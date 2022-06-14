<template>
    <template v-if="icon">
        <el-icon :color="color" :size="size">
            <svg v-if="icon.startsWith('icon-')" aria-hidden="true">
                <use :xlink:href="'#' + icon" />
            </svg>
            <component v-else :is="icon"></component>
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
