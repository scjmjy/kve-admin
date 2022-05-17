<template>
    <div class="permissionDemo">
        <div>拥有的权限标识：{{ userStore.userProfile.perms.join(", ") }}</div>
        <br />
        <div>使用指令 v-has-perm：</div>
        <div>
            <div v-has-perm="'root/dashboard'">root/dashboard</div>
            <div v-has-perm="['usermanage', 'menumanage']">['usermanage', 'menumanage']</div>
            <div v-has-perm="['usermanage', 'xxxxxxxxxxxxxx']">['usermanage', 'xxxxxxxxxxxxxx']</div>
            <div v-has-perm.some="['usermanage', 'xxxxxxxxxxxxxx']">some: ['usermanage', 'xxxxxxxxxxxxxx']</div>
            <div v-has-perm="'xxxxxxxxxxxxxx'">xxxxxxxxxxxxxx</div>
        </div>
        <br />
        <div>使用 hasPerm：</div>
        <div>
            <div v-if="userStore.hasPerm('root/dashboard')">root/dashboard</div>
            <div v-if="userStore.hasPerm(['usermanage', 'menumanage'])">['usermanage', 'menumanage']</div>
            <div v-if="userStore.hasPerm(['usermanage', 'xxxxxxxxxxxxxx'])">['usermanage', 'xxxxxxxxxxxxxx']</div>
            <div v-if="userStore.hasPerm(['usermanage', 'xxxxxxxxxxxxxx'], true)">
                some: ['usermanage', 'xxxxxxxxxxxxxx']
            </div>
            <div v-if="userStore.hasPerm('xxxxxxxxxxxxxx')">xxxxxxxxxxxxxx</div>
        </div>
    </div>
</template>

<script setup lang="ts" name="permissionDemo">
import { useUserStore } from "@/store/modules/user";
const userStore = useUserStore();
</script>

<style scoped></style>
