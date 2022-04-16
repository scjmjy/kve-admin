<template>
    <el-dialog destroy-on-close v-bind="$attrs" :modelValue="modelValue">
        <CrudForm
            :action="action"
            :column="column"
            :actions="actions"
            :formData="formData"
            :formProps="formProps"
            :formItemProps="formItemProps"
            :rules="rules"
            :items="items"
        >
        </CrudForm>
    </el-dialog>
</template>

<script setup lang="ts" name="CrudFormDlg">
import CrudForm, { CrudFormProps } from "@/components/form/CrudForm.vue";
import { DialogProps } from "element-plus";

interface CrudFormDlgProps extends Partial<DialogProps> {
    modelValue: boolean;
    // dlgProps?: DialogProps;
    action?: CrudFormProps["action"];
    column?: CrudFormProps["column"];
    actions?: CrudFormProps["actions"];
    formData?: CrudFormProps["formData"];
    formProps?: CrudFormProps["formProps"];
    formItemProps?: CrudFormProps["formItemProps"];
    rules?: CrudFormProps["rules"];
    items?: CrudFormProps["items"];
}

// interface CrudFormDlgProps extends CrudFormProps {
//     modelValue: boolean;
//     dlgProps?: DialogProps;
// }
defineProps<CrudFormDlgProps>();
</script>
