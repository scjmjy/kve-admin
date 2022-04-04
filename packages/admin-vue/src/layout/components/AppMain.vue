<template>
    <router-view v-slot="{ Component, route }">
        <transition name="transition-3d" mode="out-in">
            <keep-alive
                :include="[
                    'Index2',
                    'Page1',
                    'Page2',
                    'NestedPage1',
                    'NestedPage2',
                    'ThirdNestedPage1',
                    'ThirdNestedPage2',
                    'FourthNestedPage1',
                    'FourthNestedPage2',
                ]"
            >
                <component :is="Component" :key="route.path" />
            </keep-alive>
        </transition>
    </router-view>
</template>

<script setup lang="ts"></script>

<style scoped></style>
