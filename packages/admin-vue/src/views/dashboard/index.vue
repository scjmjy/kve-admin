<template>
    <div class="dashboardIndex">
        <p v-for="i in 100">{{ i }}</p>
    </div>
</template>

<script setup lang="ts" name="Index"></script>

<style scoped lang="scss">
.dashboardIndex {
    // height: 100%;
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
