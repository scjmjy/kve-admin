<template>
    <div>
        <p>RouteName: ThirdNestedPage1</p>
        <p>此页面进入次数: {{ count }}</p>
        <div>
            <div>演示功能:</div>
            <ul>
                <li>使用 route.params 来缓存多个详情页</li>
            </ul>
        </div>
        <p>
            <el-input v-model="param" placeholder="输入 param 值" style="width: 120px; margin-right: 10px" />
            <el-button type="primary" @click="gotoDetail">前往详情页</el-button>
        </p>
    </div>
</template>

<script setup lang="ts" name="ThirdNestedPage1">
import { onActivated, ref } from "vue";
import { useRouter } from "vue-router";
import { findRouteFullpath } from "@/router/routes";

const router = useRouter();

const count = ref(0);

const param = ref("");

onActivated(() => {
    count.value++;
});

function gotoDetail() {
    let path = findRouteFullpath("ThirdNestedPage1Detail");
    if (path) {
        path = path.replace(/:id$/, param.value);
        router.push(path);
    }
}
</script>

<style scoped></style>
