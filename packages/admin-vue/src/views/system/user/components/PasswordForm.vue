<template>
    <CrudForm
        class="passwordForm"
        :form-data="formData"
        :column="1"
        :items="formItems"
        :rules="formRules"
        :actions="formActions"
    >
    </CrudForm>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import type { FormRules } from "element-plus";
import { isValidPassword, UpdateUserPassword } from "admin-common";
import CrudForm, { ItemSchema, ActionsProp } from "@/components/form/CrudForm.vue";
import { updateUserPassword } from "@/api/user";

const emit = defineEmits(["update"]);

const formData = reactive<UpdateUserPassword & { confirmPassword: string }>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
});
const formItems = computed<ItemSchema[]>(() => [
    {
        label: "当前密码",
        prop: "oldPassword",
        item: {
            type: "ElInput",
            props: {
                type: "password",
                clearable: true,
                showPassword: true,
                placeholder: "请输入当前密码",
            },
        },
    },
    {
        label: "新密码",
        prop: "newPassword",
        item: {
            type: "ElInput",
            props: {
                type: "password",
                clearable: true,
                showPassword: true,
                placeholder: "请输入新密码",
            },
        },
    },
    {
        label: "确认密码",
        prop: "confirmPassword",
        item: {
            type: "ElInput",
            props: {
                type: "password",
                clearable: true,
                showPassword: true,
                placeholder: "请再次确认密码",
            },
        },
    },
]);

const formRules: FormRules = {
    oldPassword: {
        required: true,
        message: "当前密码不能为空！",
        trigger: ["change"],
    },
    newPassword: [
        { required: true, message: "新密码不能为空", trigger: ["change"] },
        {
            validator(rule, value, callback) {
                if (formData.oldPassword === value) {
                    callback(new Error("新密码不能和当前密码相同！"));
                } else {
                    const validation = isValidPassword(value);
                    if (validation === "fail-range") {
                        callback(new Error("密码长度为 6 到 24 个字符！"));
                    } else if (validation === "fail-strong") {
                        callback(new Error("密码必须同时包含数字，大、小字母，特殊字符中的 2 种！"));
                    } else {
                        callback();
                    }
                }
            },
            trigger: ["change"],
        },
    ],
    confirmPassword: [
        { required: true, message: "确认密码不能为空！", trigger: ["change"] },
        {
            validator(rule, value, callback) {
                if (formData.newPassword !== value) {
                    callback(new Error("两次输入的密码不一致！"));
                } else {
                    callback();
                }
            },
            trigger: ["change"],
        },
    ],
};

const formActions: ActionsProp = {
    apis: {
        update: async () => {
            await updateUserPassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
            });
            emit("update");
        },
    },
};
</script>
