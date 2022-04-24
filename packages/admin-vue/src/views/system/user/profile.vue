<template>
    <div class="userProfile is-3d">
        <DoubleFaceCard class="userProfile-card" v-model="state.rotated">
            <template #front>
                <el-descriptions class="userProfile-front" title="个人信息" :column="state.column" border>
                    <template #extra>
                        <el-button type="text" @click="onEditClick">编辑</el-button>
                    </template>
                    <el-descriptions-item v-for="item of state.items" :key="item.label">
                        <template #label>
                            <div class="userProfile-item">
                                <SvgIcon :icon="item.icon" style="margin-right: 3px"></SvgIcon>
                                <span>
                                    {{ item.label }}
                                </span>
                            </div>
                        </template>
                        <span>
                            {{ item.value }}
                        </span>
                    </el-descriptions-item>
                </el-descriptions>
                <UploadUserAvatar class="userProfile-frontAvatar" />
            </template>
            <template #back>
                <el-button type="text" @click="onBackClick">返回</el-button>
                <el-tabs class="userProfile-tabs">
                    <el-tab-pane label="基本信息">
                        <UserProfileForm action="update" @update="onUserProfileUpdate"></UserProfileForm>
                    </el-tab-pane>
                    <el-tab-pane label="密码">
                        <PasswordForm action="create" @update="onUserPasswordUpdate"></PasswordForm>
                    </el-tab-pane>
                </el-tabs>
                <UploadUserAvatar class="userProfile-backAvatar" action="edit" />
            </template>
        </DoubleFaceCard>
    </div>
</template>

<script setup lang="ts" name="UserProfile">
import { computed, reactive, ref } from "vue";
import DoubleFaceCard from "@/components/card/DoubleFaceCard.vue";
import { useUserStore } from "@/store/modules/user";
import { useSystemStore } from "@/store/modules/system";
import { i18n } from "@/i18n/message";
import UserProfileForm from "./components/UserProfileForm.vue";
import PasswordForm from "./components/PasswordForm.vue";
import UploadUserAvatar from "./components/UploadUserAvatar.vue";

const userStore = useUserStore();
const systemStore = useSystemStore();
userStore.getUserProfile();

const state = reactive({
    rotated: false,
    column: computed(() => {
        switch (systemStore.screen.mode) {
            case "xs":
            case "sm":
                return 1;
            case "md":
                return 2;
            default:
                return 3;
        }
    }),
    items: computed(() => {
        const { username, realname, gender, mobileno, email, depts, roles } = userStore.userProfile;
        const items = [
            {
                label: "用户名",
                value: username,
                icon: "User",
            },
            {
                label: "真实姓名",
                value: realname,
                icon: "UserFilled",
            },
            {
                label: "性别",
                value: i18n("gender." + gender),
                icon: "icon-gender",
            },
            {
                label: "手机号码",
                value: mobileno,
                icon: "Cellphone",
            },
            {
                label: "邮箱",
                value: email,
                icon: "Message",
            },
            {
                label: "部门",
                value: depts.map((dept) => dept.name).join(","),
                icon: "icon-department",
            },
            {
                label: "角色",
                value: roles.map((role) => role.name).join(","),
                icon: "icon-role",
            },
        ];
        return items;
    }),
});

function onEditClick() {
    state.rotated = !state.rotated;
}
function onBackClick() {
    state.rotated = !state.rotated;
}

function onUserProfileUpdate() {
    state.rotated = false;
}

function onUserPasswordUpdate() {
    state.rotated = false;
}
</script>

<style scoped lang="scss">
.userProfile {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    &-card {
        position: relative;
        width: 80%;
        max-width: 800px;
        height: 420px;
        border-radius: 25px;
        .is-xs & {
            width: 98%;
        }
        .is-sm & {
            width: 98%;
        }
    }
    &-front {
        :deep(.el-descriptions__body) {
            background-color: transparent;
        }
        :deep(.el-descriptions__cell) {
            background-color: transparent;
        }
    }
    &-frontAvatar,
    &-backAvatar {
        position: absolute;
        left: 50%;
        top: -60px;
        transform: translateX(-50%);
    }
    &-item {
        display: flex;
        align-items: center;
    }
    &-tabs {
        margin-top: 35px;
    }
    :deep(.el-descriptions__header) {
        margin-bottom: 35px;
    }
    :deep(.el-tabs__content) {
        overflow: visible;
    }
    // :deep(.doubleFaceCard-face_front) {
    //     // background: var(--el-color-info-light-7);
    // }
    // :deep(.doubleFaceCard-face_back) {
    //     // background: var(--el-color-info-light-7);
    // }
}
</style>
