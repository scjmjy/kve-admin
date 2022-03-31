<template>
    <div class="dashboardIndex">
        <!-- <div>
            <el-image src="/static/img/棒球.png"></el-image>
        </div> -->
        <el-upload
            class="avatar-uploader"
            action="http://localhost:3000/api/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            name="avatar"
            method="POST"
        >
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <!-- <img src="/api/download/111" style="width: 200px; height: 200px;" /> -->
        <el-button type="primary" @click="getUserInfo">getUserProfile</el-button>
        <el-button type="primary" @click="logout">退出</el-button>
        <el-button type="primary" @click="logout">退出</el-button>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { UploadProps } from "element-plus";
import { getUserProfile } from "@/api/user";
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();

function logout() {
    userStore.logout().finally(() => {});
}

function getUserInfo() {
    getUserProfile()
        .then((res) => {})
        .catch((err) => {});
}

const imageUrl = ref("");

const handleAvatarSuccess: UploadProps["onSuccess"] = (response, uploadFile) => {
    imageUrl.value = URL.createObjectURL(uploadFile.raw!);
};

const beforeAvatarUpload: UploadProps["beforeUpload"] = (rawFile) => {
    if (rawFile.type !== "image/jpeg") {
        ElMessage.error("Avatar picture must be JPG format!");
        return false;
    } else if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error("Avatar picture size can not exceed 2MB!");
        return false;
    }
    return true;
};
</script>

<style scoped lang="scss">
.dashboardIndex {
    height: 100%;
    background-color: grey;
    .avatar-uploader .avatar {
        width: 178px;
        height: 178px;
        display: block;
    }
}
</style>
<style>
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
    border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    text-align: center;
}
</style>
