<template>
    <el-input v-if="readonly" :modelValue="inputModelValue" readonly></el-input>
    <el-select v-else :modelValue="modelValue" v-bind="$attrs">
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

<script lang="ts">
export default {
    name: "BasicSelect",
    inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { ElSelect } from "element-plus";
import { computed } from "vue";

export interface BasicSelectProps {
    readonly?: boolean;
    options: SelectOption[];
    modelValue?: string | number | Array<string | number>;
}

export interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
}

const props = withDefaults(defineProps<BasicSelectProps>(), {
    readonly: false,
    options: () => [],
});

const inputModelValue = computed(() => {
    if (props.readonly && props.modelValue) {
        const modelValue = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue];
        const displayValue: (string | number)[] = [];
        for (const val of modelValue) {
            displayValue.push(props.options.find((opt) => opt.value === val)?.label || val);
        }
        return displayValue.join(", ");
    }
    return "";
});
</script>

<style scoped></style>
