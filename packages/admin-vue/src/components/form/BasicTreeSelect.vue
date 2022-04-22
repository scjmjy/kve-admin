<template>
    <el-input v-if="readonly" :modelValue="inputModelValue" readonly></el-input>
    <el-tree-select v-else :model-value="props.modelValue" :props="props.props" v-bind="$attrs"> </el-tree-select>
</template>

<script lang="ts">
export default {
    name: "BasicTreeSelect",
    inheritAttrs: false,
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import { TreeOptionProps } from "element-plus/es/components/tree/src/tree.type";
import Node from "element-plus/es/components/tree/src/model/node";

export interface BasicTreeSelectProps {
    readonly?: boolean;
    modelValue?: Array<any>;
    props?: TreeOptionProps;
}

const props = defineProps<BasicTreeSelectProps>();

const inputModelValue = computed(() => {
    if (props.readonly) {
        const modelValue = props.modelValue;
        const customProps = props.props;

        if (Array.isArray(modelValue) && modelValue.length && typeof modelValue[0] === "object") {
            const displayValue = modelValue.map((item) => {
                if (!customProps || !customProps.label) {
                    return item.label;
                } else if (typeof customProps.label === "string") {
                    return item[customProps.label];
                } else {
                    return customProps.label(item, undefined as unknown as Node);
                }
            });
            return displayValue.join(", ");
        } else {
            return modelValue as unknown as string;
        }
    }
    return "";
});
</script>

<style scoped></style>
