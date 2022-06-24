<template>
    <el-avatar :src="avatar" v-bind="$attrs">
        <img :src="defaultAvatar" />
    </el-avatar>
</template>

<script setup lang="ts" name="UserAvatar">
import { useUserStore } from "@/store/modules/user";
import { defaultAvatar } from "@/assets";
import { computed } from "vue";

const props = defineProps({
    modelValue: String,
    /**
     * 如果 modelValue 为空，使用默认头像而不是当前用户的头像
     */
    useDefault: Boolean,
});
const userStore = useUserStore();
const avatar = computed(() => {
    if (!userStore.isLoggedIn()) {
        return undefined;
    }
    if (props.modelValue) {
        return props.modelValue;
    }
    if (props.useDefault) {
        return undefined;
    }
    return userStore.userProfile.avatar;
});
</script>

<style scoped></style>
