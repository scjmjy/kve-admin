<template>
    <div>
        <p>RouteName: Page1</p>
        <p>此页面进入次数: {{ count }}</p>
        <div>
            <div>演示功能:</div>
            <ol>
                <li>使用 route.meta.pathKey=fullpath 来缓存多个详情页</li>
            </ol>
        </div>
        <p>
            <el-input
                v-model="queryValue"
                placeholder="输入 query 值"
                style="width: 120px; margin-right: 10px"
            ></el-input>
            <el-button type="primary" @click="gotoDetail">前往详情页</el-button>
        </p>
    </div>
</template>

<script setup lang="ts" name="page1">
import { onActivated, ref } from "vue";
import { useRouter } from "vue-router";
import { findRouteFullpath } from "@/router/routes";

const router = useRouter();

const count = ref(0);
const queryValue = ref("");

onActivated(() => {
    count.value++;
});

function gotoDetail() {
    const path = findRouteFullpath("detail1");
    if (path) {
        router.push({
            path,
            query: {
                queryKey: queryValue.value,
            },
        });
    }
}
</script>

<style scoped></style>
