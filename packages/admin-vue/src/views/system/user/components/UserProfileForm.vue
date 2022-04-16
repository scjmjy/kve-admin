<template>
    <CrudForm
        class="userProfileForm"
        :form-data="formData"
        :column="state.column"
        :items="formItems"
        :rules="formRules"
        :actions="formActions"
    >
    </CrudForm>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import type { FormRules } from "element-plus";
import { Gender, UpdateUserProfile } from "admin-common";
import CrudForm, { ItemSchema, ActionsProp } from "@/components/form/CrudForm.vue";
import { useUserStore } from "@/store/modules/user";
import { useSystemStore } from "@/store/modules/system";

const emit = defineEmits(["update"]);

const userStore = useUserStore();
const systemStore = useSystemStore();

const state = reactive({
    column: computed(() => {
        switch (systemStore.screen.mode) {
            case "xs":
            case "sm":
                return 1;
            default:
                return 2;
        }
    }),
});

const { realname, gender, mobileno, email } = userStore.userProfile;
const formData = reactive<UpdateUserProfile>({
    realname,
    gender,
    mobileno,
    email,
});

const formItems = computed<ItemSchema[]>(() => [
    {
        label: "真实姓名",
        prop: "realname",
        item: {
            type: "ElInput",
            props: {
                clearable: true,
            },
        },
    },
    {
        label: "性别",
        prop: "gender",
        item: {
            type: "BasicSelect",
            props: {
                options: [
                    {
                        label: "男",
                        value: Gender.MALE,
                    },
                    {
                        label: "女",
                        value: Gender.FEMALE,
                    },
                    {
                        label: "未知",
                        value: Gender.UNKNOWN,
                    },
                ],
            },
        },
    },
    {
        label: "手机号码",
        prop: "mobileno",
        item: {
            type: "ElInput",
            props: {
                clearable: true,
            },
        },
    },
    {
        label: "邮箱",
        prop: "email",
        item: {
            type: "ElInput",
            props: {
                clearable: true,
            },
        },
    },
]);

const formRules: FormRules = {
    realname: {
        required: true,
        message: "请输入 2 至 12 个字符",
        min: 2,
        max: 12,
        trigger: ["change"],
    },
    gender: {
        required: true,
        message: "请选择性别！",
        trigger: ["change"],
    },
    email: {
        required: false,
        type: "email",
        message: "'请输入正确的邮箱地址",
        trigger: ["change"],
    },
    mobileno: {
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        message: "请输入正确的手机号码",
        trigger: ["change"],
    },
};

const formActions: ActionsProp = {
    apis: {
        update: async () => {
            await userStore.updateUserProfile(formData);
            emit("update");
        },
    },
};
</script>

<style scoped></style>
