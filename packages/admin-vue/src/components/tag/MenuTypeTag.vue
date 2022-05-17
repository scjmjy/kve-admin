<template>
    <el-tag v-if="!(compact && modelValue !== 'action')" :type="tag.type" size="small" effect="dark" round>{{
        tag.label
    }}</el-tag>
</template>

<script setup lang="ts" name="MenuTypeTag">
import { PermissionType } from "admin-common";
import { computed, PropType } from "vue";
const props = defineProps({
    modelValue: {
        type: String as PropType<PermissionType>,
        default: "",
    },
    compact: {
        type: Boolean,
        default: false,
    },
});

const tag = computed<{ label: string; type: "" | "success" | "warning" | "info" | "danger" }>(() => {
    switch (props.modelValue) {
        case "menugroup":
            return {
                label: "菜单组",
                type: "",
            };
        case "menuitem":
            return {
                label: "菜单项",
                type: "success",
            };
        case "action":
            return {
                label: "动作",
                type: "warning",
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
