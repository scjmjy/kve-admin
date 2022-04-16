<template>
    <el-select v-bind="$attrs">
        <el-option
            v-for="option of options"
            :key="option.label"
            :label="option.label"
            :value="option.value"
            :disabled="readonly || option.disabled"
        >
        </el-option>
    </el-select>
</template>

<script setup lang="ts" name="BasicSelect">
export interface BasicSelectProps {
    readonly?: boolean;
    options: SelectOption[];
}

export interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
}

withDefaults(defineProps<BasicSelectProps>(), {
    readonly: false,
    options: () => [],
});
</script>

<style scoped></style>
