<template>
    <BasicSelect :options="options" v-bind="$attrs"></BasicSelect>
</template>

<script setup lang="ts" name="GenderSelect">
import BasicSelect, { SelectOption } from "./BasicSelect.vue";
const options: SelectOption[] = [
    {
        label: "男",
        value: "MALE",
    },
    {
        label: "女",
        value: "FEMALE",
    },
    {
        label: "未知",
        value: "UNKNOWN",
    },
];
</script>

<style scoped></style>
