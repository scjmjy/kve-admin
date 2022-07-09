<template>
    <router-link
        :key="props.route.path"
        :to="{ path: props.route.path, query: props.route.query, params: props.route.params }"
        custom
        v-slot="{ href, navigate, isActive, isExactActive }"
    >
        <span
            ref="refSpan"
            class="tab"
            :class="{
                'is-active':
                    isExactActive && (props.route.meta.pathKey === 'path' || props.route.fullPath === fullPath),
            }"
            @click="navigate"
            v-context-menu="contextMenuItems"
        >
            <!-- <el-icon v-if="props.route.meta?.icon">
                <component :is="props.route.meta?.icon"></component>
            </el-icon> -->
            {{ props.route.meta?.title }}
            <CircleCloseFilled class="el-icon--svg tab-close" @click.prevent="onCloseClick"></CircleCloseFilled>
        </span>
    </router-link>
</template>

<script setup lang="ts">
import { onMounted, PropType, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RouteRecordVisited, useSystemStore } from "@/store/modules/system";
import { ContextMenuItem } from "@/components/contextmenu/types";
import { ElMessage } from "element-plus";

const props = defineProps({
    route: {
        type: Object as PropType<RouteRecordVisited>,
        required: true,
    },
    fullPath: String,
});

const router = useRouter();
const route = useRoute();
const systemStore = useSystemStore();

function isExactActive() {
    return refSpan.value?.classList.contains("is-active") || false;
}

function onCloseClick() {
    systemStore.closeTab(props.route, isExactActive(), router);
}

const refSpan = ref<HTMLSpanElement>();

function scrollIntoView() {
    refSpan.value?.scrollIntoView({ behavior: "smooth" });
}

onMounted(() => {
    scrollIntoView();
});

watch(
    () => route.fullPath,
    (fullPath) => {
        if (fullPath === props.route.fullPath) {
            scrollIntoView();
        }
    },
);

const contextMenuItems = ref<ContextMenuItem[]>([
    {
        label: "刷新页面",
        handler() {
            systemStore.refreshTab(props.route, router);
        },
        icon: "Refresh",
    },
    {
        label: "关闭页面",
        handler() {
            systemStore.closeTab(props.route, isExactActive(), router);
        },
        icon: "Close",
        divider: "bottom",
    },
    {
        label: "关闭其他",
        handler() {
            ElMessage.warning("太忙了，暂未实现！");
        },
        icon: "CircleClose",
    },
    {
        label: "关闭右侧",
        handler() {
            ElMessage.warning("太忙了，暂未实现！");
        },
        icon: "Right",
    },
    {
        label: "关闭所有",
        handler() {
            ElMessage.warning("太忙了，暂未实现！");
        },
        icon: "CircleCloseFilled",
    },
]);
</script>

<style scoped lang="scss">
.tab {
    box-sizing: border-box;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid #353535;
    background: #202020;
    color: var(--el-text-color-secondary);
    font-size: 0.8em;
    min-width: 50px;
    margin: 0 1px;
    height: 100%;
    padding: 0 15px;
    transition: padding 0.3s, box-shadow 0.3s;
    &:first-of-type {
        border-top-left-radius: 40px;
        border-bottom-left-radius: 40px;
    }
    &:last-of-type {
        border-top-right-radius: 40px;
        border-bottom-right-radius: 40px;
    }
    &.is-active {
        background: #151515;
        border-top: none;
        border-bottom: 1px solid #252525;
        box-shadow: inset 0 0 10px 1px rgba(0, 0, 0, 0.8);
        color: var(--el-color-danger);
        font-weight: bold;
        text-shadow: 0 0 15px var(--el-color-danger);
    }
    &:hover {
        cursor: pointer;
        padding-right: 2em;
    }
    &-close {
        position: absolute;
        display: none;
        right: 0.4em;
        color: var(--el-color-danger-light-5);
        z-index: 200;
        &:hover {
            color: var(--el-color-danger);
        }
        :hover > & {
            display: inline-flex;
        }
    }
}
</style>
