<template>
    <li
        v-for="(item, index) in items"
        :key="item.label"
        class="contextMenu-item"
        :class="{ 'is-disabled': item.disabled }"
        :data-divider="item.divider"
        @click="onBtnClick(item)"
    >
        <SvgIcon v-if="item.icon" :icon="item.icon"></SvgIcon>
        <button class="contextMenu-button" :style="`animation-delay: ${index * 0.08}s`">
            {{ item.label }}
        </button>
    </li>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { ContextMenuItem } from "./types";
import SvgIcon from "@/components/svgicon/SvgIcon.vue";

defineProps({
    items: {
        type: Array as PropType<ContextMenuItem[]>,
        default: false,
    },
});

function onBtnClick(item: ContextMenuItem) {
    item.handler();
}
</script>

<style lang="scss">
.contextMenu {
    --menu-bg: linear-gradient(45deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.45) 100%);
    --menu-border: rgba(0, 0, 0, 0.08);
    --item-border: rgba(0, 0, 0, 0.1);
    --item-color: rgb(10, 20, 28);
    --item-bg-hover: rgba(10, 20, 28, 0.09);
    html.dark & {
        --menu-bg: linear-gradient(45deg, rgba(10, 20, 28, 0.25) 0%, rgba(10, 20, 28, 0.45) 100%);
        --menu-border: rgba(255, 255, 255, 0.08);
        --item-border: rgba(255, 255, 255, 0.1);
        --item-color: #fff;
        --item-bg-hover: rgba(255, 255, 255, 0.1);
    }

    overflow: hidden;
    background: var(--menu-bg);
    backdrop-filter: blur(5px);
    position: fixed;
    top: var(--top);
    left: var(--left);
    animation: menuAnimation 0.4s 0s both;
    transform-origin: left;
    list-style: none;
    margin: 4px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    z-index: 999999999;
    box-shadow: 0 0 0 1px var(--menu-border), 0 2px 2px rgb(0 0 0 / 3%), 0 4px 4px rgb(0 0 0 / 4%),
        0 10px 8px rgb(0 0 0 / 5%), 0 15px 15px rgb(0 0 0 / 6%), 0 30px 30px rgb(0 0 0 / 7%),
        0 70px 65px rgb(0 0 0 / 9%);

    &-item {
        cursor: pointer;
        color: var(--item-color);
        padding: 4px;
        display: flex;
        align-items: center;
        border-radius: 4px;

        &:hover {
            background-color: var(--item-bg-hover);
        }
    }

    &-item[data-divider="top"] {
        border-top: 1px solid;
    }

    &-item[data-divider="bottom"] {
        border-bottom: 1px solid;
    }

    &-item[data-divider="top-bottom"] {
        border-top: 1px solid;
        border-bottom: 1px solid;
    }

    &-item[data-divider] {
        border-color: var(--item-border);
    }

    &-button {
        color: inherit;
        cursor: inherit;
        background: 0;
        border: 0;
        white-space: nowrap;
        width: 100%;
        text-align: left;
        display: inline-flex;
        align-items: center;
        font-size: 14px;
        width: 100%;
        animation: menuItemAnimation 0.2s 0s both;
    }

    @keyframes menuAnimation {
        0% {
            opacity: 0;
            transform: scale(0.5);
        }

        100% {
            opacity: 1;
            border-radius: 8px;
            transform: scale(1);
        }
    }

    @keyframes menuItemAnimation {
        0% {
            opacity: 0;
            transform: translateX(-10px);
        }
        100% {
            opacity: 1;
            transform: translateX(0);
        }
    }
}
</style>
