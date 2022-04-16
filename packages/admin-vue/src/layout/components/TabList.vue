<template>
    <el-scrollbar ref="refScrollbar" class="tabList">
        <div class="tabList-wrapper" v-if="systemStore.router.visitedRoutes.length">
            <Tab v-for="tab of systemStore.router.visitedRoutes" :route="tab" :full-path="route.fullPath" />
        </div>
    </el-scrollbar>
</template>

<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onMounted, Ref, ref, watch } from "vue";
import { ElScrollbar } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { RouteRecordVisited, useSystemStore } from "@/store/modules/system";
import Tab from "./Tab.vue";

const route = useRoute();
const router = useRouter();
const systemStore = useSystemStore();

watch(
    () => route.fullPath,
    () => {
        systemStore.onRouteChanged(route);
    },
    {
        immediate: true,
    },
);
const refScrollbar = ref<InstanceType<typeof ElScrollbar>>();
let elWrapper: HTMLDivElement | undefined;

function horizontalScroll(evt: WheelEvent) {
    // console.log("[horizontalScroll]", evt);
    evt.preventDefault();
    elWrapper && (elWrapper.scrollLeft += evt.deltaY);
}

onMounted(() => {
    elWrapper = refScrollbar.value!.$refs.wrap$ as HTMLDivElement;
    elWrapper.addEventListener("wheel", horizontalScroll);
});
onBeforeUnmount(() => {
    elWrapper?.removeEventListener("wheel", horizontalScroll);
});

function onCloseClick(route: RouteRecordVisited, isExactActive: boolean) {
    systemStore.closeTab(route, isExactActive, router);
}
</script>

<style lang="scss" scoped>
.tabList {
    white-space: nowrap;
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
    border-radius: 40px;

    // :deep(.el-scrollbar__bar) {
    //     bottom: 0px;
    // }
    :deep(.el-scrollbar__view) {
        height: 100%;
    }
    &-wrapper {
        display: inline-flex;
        background: #151515;
        box-shadow: inset 0 0 2px 2px rgba(0, 0, 0, 0.5);
        border-radius: 40px;
        padding: 2px;
        height: 100%;
        box-sizing: border-box;
    }
}
</style>
