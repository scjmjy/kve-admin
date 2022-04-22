<template>
    <el-dialog
        v-model="modelValue"
        :title="title"
        destroy-on-close
        :close-on-click-modal="false"
        :before-close="onBeforeClose"
    >
        <CrudForm
            ref="crudForm"
            :action="action"
            :column="column"
            :actions="actions"
            :formData="formData"
            :formProps="formProps"
            :formItemProps="formItemProps"
            :rules="rules"
            :items="items"
            @change="onFormChange"
            @formaction="onFormAction"
            @update:action="onUpdateAction"
        >
        </CrudForm>
    </el-dialog>
</template>

<script setup lang="ts" name="CrudFormDlg">
import { computed, ref } from "vue";
import { DialogProps, DialogBeforeCloseFn, ElMessageBox } from "element-plus";
import CrudForm, { CrudFormProps, FormAction } from "@/components/form/CrudForm.vue";

interface CrudFormDlgProps extends Partial<DialogProps> {
    modelValue: boolean;
    action?: CrudFormProps["action"];
    column?: CrudFormProps["column"];
    actions?: CrudFormProps["actions"];
    formData?: CrudFormProps["formData"];
    formProps?: CrudFormProps["formProps"];
    formItemProps?: CrudFormProps["formItemProps"];
    rules?: CrudFormProps["rules"];
    items?: CrudFormProps["items"];
}

const props = defineProps<CrudFormDlgProps>();

interface CrudFormEmits {
    (event: "change", formData: Record<string, any>): void;
    (event: "formaction", action: FormAction | "delete" | "back", err?: any): void;
    (event: "update:modelValue", value: boolean): void;
    (event: "update:action", action: FormAction): void;
}

const emit = defineEmits<CrudFormEmits>();

const title = computed(() => {
    switch (props.action) {
        case "create":
            return "新建";
        case "update":
            return "编辑";
        case "read":
            return "详情";
        default:
            break;
    }
});

function onFormChange(formData: Record<string, any>) {
    emit("change", formData);
}
async function onFormAction(action: FormAction | "delete" | "back", err?: any) {
    if (action === "back") {
        emit("update:modelValue", false);
    }
    emit("formaction", action, err);
}
function onUpdateAction(action: FormAction) {
    emit("update:action", action);
}

const crudForm = ref<InstanceType<typeof CrudForm>>();

const onBeforeClose: DialogBeforeCloseFn = (done) => {
    if (props.action !== "read" && crudForm.value?.state.changed) {
        ElMessageBox.confirm("您已经编辑过的数据会丢失，确定关闭吗", "温馨提示")
            .then(() => {
                emit("update:modelValue", false);
                done(false);
            })
            .catch(() => {
                done(true);
            });
    } else {
        emit("update:modelValue", false);
        done(false);
    }
};
</script>
