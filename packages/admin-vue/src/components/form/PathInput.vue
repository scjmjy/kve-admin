<template>
    <el-input :model-value="modelValue" v-bind="$attrs">
        <template v-if="state.showPrepend" #prepend>
            <el-tooltip v-if="state.showTooltip" placement="top" :content="prefix">
                <span>{{ state.prefixEllipsis }}</span>
            </el-tooltip>
            <span v-else>{{ prefix }}</span>
        </template>
    </el-input>
</template>

<script setup lang="ts" name="PathInput">
import { isExternalLink } from "@/utils/is";
import { computed, reactive } from "@vue/reactivity";

const props = defineProps({
    modelValue: {
        type: String,
    },
    prefix: {
        type: String,
        default: undefined,
    },
});
const state = reactive({
    showPrepend: computed(() => {
        if (props.modelValue && (isExternalLink(props.modelValue) || props.modelValue.startsWith("/"))) {
            return false;
        }
        return !!props.prefix;
    }),
    showTooltip: computed(() => props.prefix && props.prefix.length >= 10),
    prefixEllipsis: computed(() => {
        if (!props.prefix) {
            return "";
        }
        return props.prefix.slice(0, 10) + "...";
    }),
});
</script>

<style scoped lang="scss">
:deep(.el-input-group__prepend) {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 40%;
}
</style>
