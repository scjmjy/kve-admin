<template>
    <el-button v-bind="$attrs" @click="onBtnClick">
        <slot />
        <input
            ref="refFileInput"
            class="fileSelectButton-input"
            type="file"
            :accept="state.accept"
            :multiple="multiple"
            @change="onFileInputChange"
        />
    </el-button>
</template>

<script setup lang="ts" name="FileSelectButton">
import { computed, PropType, reactive, ref } from "vue";

export type FileAccept = "*" | "image" | "word" | "pdf" | "excel" | "ppt" | "audio" | "video" | "zip";
export type FileAcceptProp = FileAccept | FileAccept[];

const FileTypeMap: Record<FileAccept, string> = {
    "*": "*",
    image: "image/jpeg,image/png",
    word: "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pdf: "application/pdf",
    excel: "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    audio: "audio/*",
    video: "video/*",
    zip: "application/zip,application/vnd.rar",
};

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

const state = reactive({
    accept: computed(() => {
        const types = Array.isArray(props.accept) ? props.accept : [props.accept];
        if (types.includes("*")) {
            return "*";
        } else {
            const accept: string[] = [];
            for (const type of types) {
                accept.push(FileTypeMap[type]);
            }
            return accept.join(",");
        }
    }),
});

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
