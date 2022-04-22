<template>
    <BasicSelect :options="options"></BasicSelect>
</template>

<script setup lang="ts" name="StatusSelect">
import BasicSelect, { SelectOption } from "./BasicSelect.vue";
const options: SelectOption[] = [
    {
        label: "启用",
        value: "enabled",
    },
    {
        label: "禁用",
        value: "disabled",
    },
    {
        label: "删除",
        value: "deleted",
    },
];
</script>

<style scoped></style>
