<template>
    <div class="login">
        <DoubleFaceCardVue class="login-card" v-model="state.rotated">
            <template #front>
                <el-form ref="formCrt" class="login-form login-form_login" :model="credential" :rules="credentialRules">
                    <h3 class="login-title text-3d">iFlyIT 后台管理系统</h3>
                    <el-form-item prop="userName">
                        <el-input v-model="credential.userName" placeholder="输入用户名"></el-input>
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
                        <el-button type="text" @click.prevent="rotateCard">找回密码</el-button>
                    </div>
                </el-form>
            </template>
            <template #back>
                <el-form ref="formFind" class="login-form login-form_find" :model="find" :rules="findRules">
                    <h3 class="login-title text-3d">找回密码</h3>
                    <el-form-item prop="userName">
                        <el-input v-model="find.userName" placeholder="输入用户名"></el-input>
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
                        <el-button type="text" @click.prevent="rotateCard">返回登录</el-button>
                    </div>
                </el-form>
            </template>
        </DoubleFaceCardVue>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import DoubleFaceCardVue from "@/components/card/DoubleFaceCard.vue";
import type { FormInstance, FormRules } from "element-plus";
import { useUserStore } from "@/store/modules/user";
import { useRoute, useRouter } from "vue-router";
import { LoginCredential } from "@common/login";
import { ROUTE_PATH } from "@/router/routes";

const router = useRouter();
const route = useRoute();

const credential = reactive<LoginCredential>({
    userName: "",
    password: "",
});
const find = reactive({
    userName: "",
    phoneNumber: "",
});

const state = reactive({
    rotated: false,
    loggingIn: false,
});

const credentialRules: FormRules = {
    userName: {
        required: true,
        message: "用户名不能为空",
    },
    password: {
        required: true,
        message: "密码不能为空",
    },
};

const findRules: FormRules = {
    userName: {
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
            console.info("[FORM] - OK");
            const userStore = useUserStore();
            userStore
                .login(credential)
                .then(() => {
                    // console.log('[login.vue]', res);

                    const redirect = route.query.redirect as string;
                    router.push({
                        path: redirect || ROUTE_PATH.DASHBOARD,
                    });
                })
                .catch((err) => {
                    console.error("[login.vue]", err);
                });
        })
        .catch((err) => {
            console.error("[FORM]", err);
        });
}
function handleFind() {
    formFind.value
        ?.validate()
        .then(() => {
            console.info("[FORM] - OK");
        })
        .catch((err) => {
            console.error("[FORM]", err);
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
        color: var(--el-color-primary-light-7);
    }

    &-card {
        width: 400px;
        height: 400px;
        // border-radius: var(--el-border-radius-base);
        border-radius: 25px;

        // background-color: white;
        // box-shadow: var(--el-box-shadow-light);
        // transition: transform 0.3s ease;

        &:hover {
            // box-shadow: 0px 0px 40px 0px rgb(128 128 128 / 80%);
            // transform: translateZ(100px);
            // transform: translateZ(100px) scale3d(1.07, 1.07, 1.07);
            // transform: scale3d(1.07, 1.07, 1.07);
        }
    }

    &-form {
        // padding: 25px;
        // transform-style: preserve-3d;

        &_login {
        }
        &_find {
        }
    }
    // &-test {
    //     transform: translateZ(100px) scale(0.98);
    //     transform-style: preserve-3d;
    // }

    // &-loginForm {
    //     transform: translateZ(100px) scale(0.98);
    //     perspective: inherit;
    // }
    &-findPassword {
        display: flex;
        justify-content: flex-end;
    }
}
</style>
