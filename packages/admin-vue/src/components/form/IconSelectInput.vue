<template>
    <el-popover placement="bottom-start" :width="540" trigger="click">
        <template #reference>
            <el-input :model-value="modelValue" placeholder="点击选择图标" v-bind="$attrs" readonly>
                <template #prefix>
                    <SvgIcon v-if="modelValue" :icon="modelValue" />
                </template>
            </el-input>
        </template>
        <IconSelect ref="iconSelectRef" @change="onIconChange" />
    </el-popover>
</template>

<script lang="ts">
export default {
    name: "IconSelectInput",
    inheritAttrs: false,
};
</script>

<script setup lang="ts">
import IconSelect from "./IconSelect.vue";

const props = defineProps({
    modelValue: {
        type: String,
    },
});

const emit = defineEmits<{
    (event: "update:modelValue", icon: string): void;
}>();

function onIconChange(icon: string) {
    emit("update:modelValue", icon);
}
</script>

<style scoped></style>
