<template>
    <el-button v-bind="$attrs" @click="onBtnClick">
        <slot />
        <input
            ref="refFileInput"
            class="fileSelectButton-input"
            type="file"
            :accept="fileAccept"
            :multiple="multiple"
            @change="onFileInputChange"
        />
    </el-button>
</template>

<script setup lang="ts" name="FileSelectButton">
import { PropType, ref, toRef } from "vue";
import { FileAcceptProp, useFileAccept } from "@/composables/useFileAccept";

const props = defineProps({
    accept: {
        type: [String, Array] as PropType<FileAcceptProp>,
        default: "*",
    },
    multiple: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits<{
    (event: "change", files: FileList): void;
}>();

const { fileAccept } = useFileAccept(toRef(props, "accept"));

function onFileInputChange(evt: Event) {
    const files = (evt.target as HTMLInputElement).files!;
    emit("change", files);
}

const refFileInput = ref<HTMLInputElement>();
function onBtnClick() {
    refFileInput.value?.click();
}
</script>

<style scoped lang="scss">
.fileSelectButton {
    &-input {
        display: none;
        z-index: -9999;
    }
}
</style>
