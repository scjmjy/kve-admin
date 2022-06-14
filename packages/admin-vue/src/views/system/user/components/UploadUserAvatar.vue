<template>
    <div class="userAvatar">
        <UserAvatar :class="$attrs.class" :src="userStore.userProfile.avatar" :size="size" @error="onAvatarError" />
        <SvgIcon class="userAvatar-maskIcon" :icon="state.maskIcon" @click="onMaskIconClick"></SvgIcon>
        <el-image-viewer
            v-if="action === 'view' && state.isShowViewer"
            :url-list="state.previewUrlList"
            teleported
            hide-on-click-modal
            @close="state.isShowViewer = false"
        />
        <el-dialog
            v-if="action === 'edit'"
            v-model="state.isShowDlg"
            custom-class="userAvatar-dlg"
            title="修改头像"
            width="800px"
            append-to-body
            destroy-on-close
            @opened="onDlgOpened"
        >
            <el-row>
                <el-col :xs="24" :md="14" class="is-flex is-vertical is-between" :style="{ height: '400px' }">
                    <VueCropper
                        ref="refCropper"
                        :img="state.options.img"
                        :info="true"
                        :autoCrop="state.options.autoCrop"
                        :autoCropWidth="state.options.autoCropWidth"
                        :autoCropHeight="state.options.autoCropHeight"
                        :fixedBox="state.options.fixedBox"
                        @realTime="onRealTime"
                    />
                    <div class="is-flex is-between is-hFull" style="margin-top: 20px">
                        <FileSelectButton accept="image" :icon="Upload" @change="onFileChange"
                            >选择头像</FileSelectButton
                        >
                        <el-button-group>
                            <el-button :icon="Plus" @click="changeScale(1)"></el-button>
                            <el-button :icon="Minus" @click="changeScale(-1)"></el-button>
                            <el-button :icon="RefreshLeft" @click="rotateLeft()"></el-button>
                            <el-button :icon="RefreshRight" @click="rotateRight()"></el-button>
                        </el-button-group>
                    </div>
                </el-col>
                <el-col :xs="24" :md="10" :style="{ height: '400px' }" class="is-flex is-vertical is-hCenter">
                    <div class="userAvatar-dlg-avatar">
                        <img :src="state.previews.url" :style="state.previews.img" />
                    </div>

                    <div class="is-flex is-hCenter">
                        <el-button type="primary" :icon="UploadFilled" :loading="state.loading" @click="uploadAvatar"
                            >上传头像</el-button
                        >
                    </div>
                </el-col>
            </el-row>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { PropType, reactive, ref } from "vue";
import { VueCropper } from "vue-cropper";
import { Minus, Plus, RefreshLeft, RefreshRight, Upload, UploadFilled } from "@element-plus/icons-vue";
import { useUserStore } from "@/store/modules/user";
import { defaultAvatar } from "@/assets";

const props = defineProps({
    action: {
        type: String as PropType<"view" | "edit">,
        default: "view",
    },
    size: {
        type: Number,
        default: 100,
    },
});

const emit = defineEmits(["upload"]);

const userStore = useUserStore();

const state = reactive({
    loading: false,
    isShowDlg: false,
    isShowViewer: false,
    maskIcon: props.action === "view" ? "View" : "UploadFilled",
    options: {
        img: userStore.userProfile.avatar, //裁剪图片的地址
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 200, // 默认生成截图框宽度
        autoCropHeight: 200, // 默认生成截图框高度
        fixedBox: true, // 固定截图框大小 不允许改变
    },
    previews: {
        url: userStore.userProfile.avatar,
        img: {},
    },
    previewUrlList: [userStore.userProfile.avatar],
});

function onAvatarError() {
    state.options.img = defaultAvatar;
    state.previewUrlList = [defaultAvatar];
}

function onDlgOpened() {}

function onMaskIconClick() {
    if (props.action === "view") {
        state.isShowViewer = true;
    } else {
        state.isShowDlg = true;
    }
}

function onRealTime(data: any) {
    state.previews = data;
}

interface VueCropperType {
    rotateLeft(): void;
    rotateRight(): void;
    changeScale(num: number): void;
    getCropData(cb: (base64: string) => void): void;
}

const refCropper = ref<VueCropperType>();

// 向左旋转
function rotateLeft() {
    refCropper.value?.rotateLeft();
}
// 向右旋转
function rotateRight() {
    refCropper.value?.rotateRight();
}
// 图片缩放
function changeScale(num: number) {
    num = num || 1;
    refCropper.value?.changeScale(num);
}

function onFileChange(files: FileList) {
    const file = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        state.options.img = reader.result as string;
    };
}

function uploadAvatar() {
    state.loading = true;
    refCropper.value?.getCropData((base64: string) => {
        userStore
            .uploadUserAvatar(base64)
            .then(() => {
                state.isShowDlg = false;
                state.options.img = userStore.userProfile.avatar;
                state.previewUrlList = [userStore.userProfile.avatar];
                emit("upload");
            })
            .finally(() => {
                state.loading = false;
            });
    });
}
</script>

<style scoped lang="scss">
.userAvatar {
    cursor: pointer;
    // position: relative;
    &-maskIcon {
        opacity: 0;
        transition: opacity 0.3s;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        color: #d6d6d6;
        font-size: xxx-large;
        background-color: rgba(0, 0, 0, 0.4);
        :hover > & {
            opacity: 1;
        }
    }
    &-fileInput {
        display: none;
        z-index: -9999;
    }
}
</style>

<style lang="scss">
.userAvatar-dlg {
    &-avatar {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        box-shadow: 0 0 4px #ccc;
        overflow: hidden;
        margin: auto 0;
    }
}
</style>
