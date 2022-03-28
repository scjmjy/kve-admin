<template>
    <el-config-provider>
        <router-view v-slot="{ Component }">
            <transition mode="out-in" name="transition-3d"> <component :is="Component" /> </transition>
        </router-view>
    </el-config-provider>
</template>

<script setup lang="ts"></script>

<style lang="scss">
@use "@/assets/styles/index.scss";

// #app {
//     font-family: Avenir, Helvetica, Arial, sans-serif;
//     -webkit-font-smoothing: antialiased;
//     -moz-osx-font-smoothing: grayscale;
//     text-align: center;
//     color: #2c3e50;
//     margin-top: 60px;
// }
</style>
