<template>
    <div class="login">
        <DoubleFaceCard class="login-card" v-model="state.rotated">
            <template #front>
                <el-form
                    ref="formCrt"
                    class="is-3d login-form login-form_login"
                    :model="credential"
                    :rules="credentialRules"
                >
                    <h3 class="login-title text-3d">KVE 全栈后台管理系统</h3>
                    <el-form-item prop="username">
                        <el-input v-model="credential.username" placeholder="输入用户名"></el-input>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input
                            v-model="credential.password"
                            type="password"
                            show-password
                            placeholder="输入密码"
                            @keyup.enter="handleLogin"
                        ></el-input>
                    </el-form-item>
                    <el-form-item style="margin-top: 40px; width: 100%">
                        <el-button
                            :loading="state.loggingIn"
                            size="large"
                            type="primary"
                            style="width: 100%"
                            @click.prevent="handleLogin"
                            >登 录
                        </el-button>
                    </el-form-item>
                    <div class="login-findPassword">
                        <el-link type="primary" @click.prevent="rotateCard">找回密码</el-link>
                    </div>
                    <table style="font-size: 0.6em">
                        <tr>
                            <th>用户名</th>
                            <th>密码</th>
                        </tr>
                        <tr>
                            <td>superadmin</td>
                            <td>123456</td>
                        </tr>
                        <tr>
                            <td>admin01</td>
                            <td>123456</td>
                        </tr>
                        <tr>
                            <td>admin02</td>
                            <td>123456</td>
                        </tr>
                    </table>
                </el-form>
            </template>
            <template #back>
                <el-form ref="formFind" class="is-3d login-form login-form_find" :model="find" :rules="findRules">
                    <h3 class="login-title text-3d">找回密码</h3>
                    <el-form-item prop="username">
                        <el-input v-model="find.username" placeholder="输入用户名"></el-input>
                    </el-form-item>
                    <el-form-item prop="phoneNumber">
                        <el-input
                            v-model="find.phoneNumber"
                            placeholder="输入手机号码"
                            @keyup.enter="handleFind"
                        ></el-input>
                    </el-form-item>
                    <el-form-item style="margin-top: 40px; width: 100%">
                        <el-button
                            :loading="state.loggingIn"
                            size="large"
                            type="primary"
                            style="width: 100%"
                            @click.prevent="handleFind"
                            >确 认
                        </el-button>
                    </el-form-item>
                    <div class="login-back2loign">
                        <el-link type="primary" @click.prevent="rotateCard">返回登录</el-link>
                    </div>
                </el-form>
            </template>
        </DoubleFaceCard>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import DoubleFaceCard from "@/components/card/DoubleFaceCard.vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { LoginCredential } from "admin-common";
import { useUserStore } from "@/store/modules/user";
import { useRoute, useRouter } from "vue-router";
import { ROUTE_PATH } from "@/router/consts";

const router = useRouter();
const route = useRoute();

const credential = reactive<LoginCredential>({
    username: "",
    password: "",
});
const find = reactive({
    username: "",
    phoneNumber: "",
});

const state = reactive({
    rotated: false,
    loggingIn: false,
});

const credentialRules: FormRules = {
    username: {
        required: true,
        message: "用户名不能为空",
    },
    password: {
        required: true,
        message: "密码不能为空",
    },
};

const findRules: FormRules = {
    username: {
        required: true,
        message: "用户名不能为空",
    },
    phoneNumber: {
        required: true,
        message: "手机号码不能为空",
    },
};

const formCrt = ref<FormInstance>();
const formFind = ref<FormInstance>();

function handleLogin() {
    formCrt.value
        ?.validate()
        .then(() => {
            const userStore = useUserStore();
            state.loggingIn = true;
            userStore
                .login(credential)
                .then(() => {
                    const redirect = route.query.redirect as string;
                    return router.push({
                        path: redirect || ROUTE_PATH.DASHBOARD,
                    });
                })
                .finally(() => {
                    state.loggingIn = false;
                });
        })
        .catch((err) => {
            console.error("[handleLogin]", err);
        });
}
function handleFind() {
    formFind.value
        ?.validate()
        .then(() => {
            ElMessage.warning("功能未实现！");
        })
        .catch((err) => {
            console.error("[handleFind]", err);
        });
}
function rotateCard() {
    state.rotated = !state.rotated;
}
</script>

<style scoped lang="scss">
.login {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: var(--el-border-color-lighter);

    &-title {
        font-size: 1.5rem;
        color: var(--el-text-color-primary);
    }

    &-card {
        width: 400px;
        height: 400px;
        border-radius: 25px;
    }

    // &-form {
    //     &_login {
    //     }
    //     &_find {
    //     }
    // }

    &-findPassword {
        display: flex;
        justify-content: flex-end;
    }
}
</style>
