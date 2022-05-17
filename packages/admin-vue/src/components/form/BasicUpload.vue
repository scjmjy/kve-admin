<template>
    <el-upload
        :class="{ 'is-readonly': readonly, 'is-empty': !modelValue?.length }"
        action="#"
        list-type="picture-card"
        :file-list="modelValue"
        :accept="fileAccept"
        :auto-upload="false"
        drag
        @change="handleChange"
        @exceed="handleExceed"
    >
        <el-icon><Plus /></el-icon>
        <span>点击或拖拽</span>
        <template #file="{ file }">
            <div :title="file.name">
                <img v-if="isImg(file.name)" class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                <img v-else class="el-upload-list__item-thumbnail" :src="getFileIcon(file.name)" alt="" />
                <label class="el-upload-list__item-status-label">
                    <el-icon class="el-icon--upload-success el-icon--check"><Check /></el-icon>
                </label>
                <span
                    class="el-upload-list__item-actions"
                    v-loading="file.__downloading"
                    element-loading-background="transparent"
                >
                    <span
                        v-if="
                            !isBase64(file.url) &&
                            (isImg(file.name) || isPdf(file.name) || isAudio(file.name) || isVideo(file.name))
                        "
                        @click="handlePreview(file)"
                    >
                        <el-icon><zoom-in /></el-icon>
                    </span>
                    <span v-if="!file.raw" @click="handleDownload(file)">
                        <el-icon><Download /></el-icon>
                    </span>
                    <span v-if="!readonly" @click="handleRemove(file)">
                        <el-icon><Delete /></el-icon>
                    </span>
                </span>
            </div>
        </template>
        <template #tip>
            <div v-if="tip" class="el-upload__tip">{{ tip }}</div>
            <div v-if="readonly && !modelValue?.length">暂无文件</div>
        </template>
        <el-image-viewer
            v-if="state.isShowViewer"
            :url-list="state.previewUrlList"
            teleported
            hide-on-click-modal
            @close="state.isShowViewer = false"
        />
    </el-upload>
</template>

<script lang="ts" setup name="BasicUpload">
import { reactive, ref, toRef } from "vue";
import { Check, Delete, Download, Plus, ZoomIn } from "@element-plus/icons-vue";
import { UploadProps, UploadFile, UploadUserFile, ElMessage } from "element-plus";
import { getBase64Type, isBase64 } from "admin-common";
import { FileAcceptProp, useFileAccept } from "@/composables/useFileAccept";
import {
    realSize,
    parseSize,
    isImg,
    getFileIcon,
    getExtFromType,
    isPdf,
    isAudio,
    isVideo,
    extname,
} from "@/utils/file";
import { request } from "@/api/request";

export interface BasicUploadProps {
    modelValue?: Array<UploadUserFile>;
    accept?: FileAcceptProp;
    readonly?: boolean;
    /** 单个文件最大尺寸, 参考 parseSize */
    maxSize?: string;
    tip?: string;
}

const props = withDefaults(defineProps<BasicUploadProps>(), {
    accept: "*",
    maxSize: "16MB",
});

const emit = defineEmits<{
    (event: "update:modelValue", files: UploadUserFile[]): void;
}>();

const state = reactive({
    isShowViewer: false,
    previewUrlList: [] as string[],
});

const { fileAccept } = useFileAccept(toRef(props, "accept"));

const handleRemove = (file: UploadFile) => {
    const foundIndex = props.modelValue!.findIndex((item) => item.uid === file.uid);
    props.modelValue!.splice(foundIndex, 1);
};

const handlePreview = (file: UploadFile) => {
    if (isPdf(file.name) || isAudio(file.name) || isVideo(file.name)) {
        const elAnchor = document.createElement("a");
        elAnchor.target = "_blank";
        elAnchor.href = file.url!;
        elAnchor.removeAttribute("download");
        elAnchor.click();
    } else if (isImg(file.name)) {
        state.previewUrlList = [file.url!];
        state.isShowViewer = true;
    }
};

const handleDownload = (file: UploadFile) => {
    // @ts-ignore
    file.__downloading = true;
    const elAnchor = document.createElement("a");
    elAnchor.target = "_blank";
    const url = file.url!;
    const base64type = getBase64Type(url);
    if (base64type) {
        elAnchor.href = url;
        let ext = extname(file.name);
        if (ext) {
            elAnchor.download = file.name;
        } else {
            ext = getExtFromType(base64type);
            elAnchor.download = "download" + ext;
        }
        elAnchor.click();
        setTimeout(() => {
            // @ts-ignore
            file.__downloading = false;
        }, 500);
    } else {
        request
            .get<void, Blob>(url, {
                responseType: "blob",
            })
            .then((res: Blob) => {
                const mimetype = res.type;

                const url = URL.createObjectURL(res);
                elAnchor.href = url;
                setTimeout(function () {
                    URL.revokeObjectURL(url);
                }, 4e4); // 40s

                let ext = extname(file.name);
                if (ext) {
                    elAnchor.download = file.name;
                } else {
                    ext = getExtFromType(mimetype);
                    elAnchor.download = "download" + ext;
                }
                elAnchor.click();
            })
            .finally(() => {
                setTimeout(() => {
                    // @ts-ignore
                    file.__downloading = false;
                }, 500);
            });
    }
};

const handleChange: UploadProps["onChange"] = (uploadFile, uploadFiles) => {
    if (props.maxSize && uploadFile.size) {
        const fileSize = realSize(uploadFile.size);
        const maxSize = parseSize(props.maxSize);
        if (fileSize > maxSize) {
            ElMessage.warning(`文件或图片尺寸超过限制 ${props.maxSize}：${uploadFile.name}`);
            uploadFiles.splice(uploadFiles.findIndex((file) => file.uid === uploadFile.uid));
        }
    }
    if (!props.modelValue) {
        emit("update:modelValue", uploadFiles);
    }
};

const handleExceed: UploadProps["onExceed"] = () => {
    ElMessage.warning("文件或图片个数超过限制！");
};
</script>

<style lang="scss" scoped>
$size: 96px;
:deep(.el-upload-list--picture-card) {
    --el-upload-list-picture-card-size: #{$size};
}
:deep(.el-upload--picture-card) {
    --el-upload-picture-card-size: #{$size};
}
:deep(.el-upload-dragger) {
    width: $size;
    height: $size;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    span {
        font-size: 12px;
    }
}
</style>

<style lang="scss">
.is-readonly .el-upload-list .el-upload {
    display: none;
}
.is-readonly.is-empty > .el-upload-list {
    display: none;
}
</style>
