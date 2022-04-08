<template>
    <div></div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const {
    params: { path },
    query,
} = route;

router.replace({ path: path as string, query });
</script>
