<template>
    <el-tag :type="tag.type">{{ tag.label }}</el-tag>
</template>

<script setup lang="ts" name="StatusTag">
import { computed, PropType } from "vue";
const props = defineProps({
    modelValue: {
        type: String as PropType<EnableStatus>,
        default: "",
    },
});

const tag = computed<{ label: string; type: "" | "success" | "warning" | "info" | "danger" }>(() => {
    switch (props.modelValue) {
        case "enabled":
            return {
                label: "启用",
                type: "success",
            };
        case "disabled":
            return {
                label: "禁用",
                type: "warning",
            };
        case "deleted":
            return {
                label: "删除",
                type: "danger",
            };
        default:
            return {
                label: "未知",
                type: "info",
            };
    }
});
</script>

<style scoped></style>
