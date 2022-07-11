<template>
    <div class="appFooter">
        <div>Footer Section</div>
        <div>Footer Section</div>
    </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.appFooter {
    position: sticky;
    top: 100%;
    height: 60px;
    background: linear-gradient(45deg, rgb(104, 221, 196), rgb(72, 114, 206));
    color: var(--el-color-info-light-3);
    // background-color: var(--el-color-info-light-7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    &:hover {
        color: var(--el-color-secondary);
    }
}
</style>
