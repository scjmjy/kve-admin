<template>
    <el-form
        ref="refForm"
        class="crudForm"
        :model="formData"
        :rules="state.formRules"
        v-bind="Object.assign($options.props.formProps.default(), formProps)"
        v-loading="state.loading"
        element-loading-background="transparent"
        @validate="onValidate"
    >
        <slot name="prepend" />
        <el-row :gutter="20">
            <el-col
                v-for="(item, index) of items"
                :key="index"
                :span="state.span || item.span || (1 / items.length) * 24"
            >
                <el-form-item
                    :label="item.label"
                    :prop="item.prop"
                    v-bind="Object.assign($options.props.formItemProps.default(), formItemProps, item.attrs)"
                >
                    <component
                        v-model="formData[item.prop]"
                        :is="item.item.type"
                        v-bind="item.item.props"
                        :readonly="state.readonly"
                    ></component>
                </el-form-item>
            </el-col>
        </el-row>
        <slot name="append" />
        <template v-if="formActions.show !== false">
            <div v-if="!$slots.actions" class="crudForm-actions">
                <el-button
                    class="crudForm-actions-action"
                    :type="state.actionType"
                    :disabled="state.actionDisabled"
                    :loading="state.loading"
                    @click="handleAction"
                    >{{ state.actionLabel }}</el-button
                >
                <el-button
                    v-if="action === 'view' && formActions.deletable"
                    class="crudForm-actions-delete"
                    type="text"
                    @click="handleDelete"
                    >{{ formActions.labels.delete }}</el-button
                >
            </div>
            <slot v-else name="actions" class="crudForm-actions"></slot>
        </template>
    </el-form>
</template>

<script setup lang="ts" name="CrudForm">
import { computed, getCurrentInstance, PropType, reactive, ref, watch } from "vue";
import { ElForm, ElMessage } from "element-plus";
import { FormProps, FormItemProps, FormRules, InputProps,ElSelect, ElTreeSelect } from "element-plus";
import type { BasicSelectProps } from "./BasicSelect.vue";
import { useInvalidProps } from "@/composables/useForm";
import { merge } from "lodash-es";

export type CrudFormItem =
    | {
          type: "BasicSelect";
          props: BasicSelectProps;
      }
    | {
          type: "ElInput";
          props: Partial<InputProps>;
      }
    | {
          type: "ElTreeSelect";
          props: Record<string, any>;
      };

export interface ItemSchema {
    label: string;
    prop: string;
    span?: number;
    attrs?: Record<string, any>;
    item: CrudFormItem;
}

export type FormAction = "create" | "read" | "update";

export interface ActionsProp {
    show?: boolean;
    deletable?: boolean;
    resetable?: boolean;
    backtip?: boolean;
    labels?: { [k in FormAction | "delete"]: string };
    apis?: {
        [k in FormAction | "delete"]?: () => Promise<any>;
    };
}

export interface CrudFormProps {
    action?: FormAction;
    column?: number;
    actions?: ActionsProp;
    formData?: Record<string, any>;
    formProps?: Partial<FormProps>;
    formItemProps?: Partial<FormItemProps>;
    rules?: FormRules;
    items?: ItemSchema[];
}

const instance = getCurrentInstance();
const props = withDefaults(defineProps<CrudFormProps>(), {
    action: "read",
    actions: () => ({
        show: true,
        deletable: true,
        resetable: true,
        backtip: true,
        labels: {
            create: "提交",
            read: "返回",
            update: "更新",
            delete: "删除",
        },
        apis: {},
    }),
    formProps: () => ({
        labelPosition: "right",
        labelWidth: "80px",
    }),
    formItemProps: () => ({}),
    formData: () => ({}),
    items: () => [],
});

const emit = defineEmits(["change", "back"]);

const { invalid, onValidate, resetValidation } = useInvalidProps(props.formData, props.rules);

const formActions = computed<Required<ActionsProp>>(() => {
    const defaultActions = instance!.proxy!.$options.props.actions.default();
    merge(defaultActions, props.actions);
    return defaultActions;
});

const state = reactive({
    loading: false,
    span: computed(() => (props.column ? 24 / props.column : undefined)),
    actionLabel: computed(() => {
        return formActions.value.labels[props.action];
    }),
    actionType: computed(() => {
        switch (props.action) {
            case "create":
                return "primary";
            case "read":
                return "info";
            case "update":
                return "warning";
        }
    }),
    actionDisabled: computed(() => {
        if (props.action === "read") {
            return false;
        }
        return invalid.value;
    }),
    readonly: computed(() => props.action === "read"),
    formRules: computed(() => (props.action === "read" ? undefined : props.rules)),
    changed: false,
});

watch(
    () => props.formData,
    () => {
        state.changed = true;
        emit("change");
    },
    {
        deep: true,
    },
);
// const formData = reactive<Record<string, any>>({});
const refForm = ref<InstanceType<typeof ElForm>>();
function handleAction() {
    switch (props.action) {
        case "read":
            emit("back");
            break;
        case "create":
        case "update":
            refForm.value?.validate((isValid) => {
                if (isValid) {
                    const api = formActions.value.apis[props.action];
                    if (api) {
                        state.loading = true;
                        api()
                            .then(() => {
                                // resetValidation(props.formData, props.rules);
                            })
                            .catch((err) => {
                                // ElMessage.error("操作失败！");
                                console.error("[CrudForm]", err);
                            })
                            .finally(() => {
                                state.loading = false;
                            });
                    }
                } else {
                    ElMessage.warning("表单验证失败！");
                }
            });
            break;
        default:
            break;
    }
}
function handleDelete() {}
</script>

<style lang="scss" scoped>
.crudForm {
    &-actions {
        margin-top: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;

        &-action {
            width: 50%;
        }

        &-delete {
            color: var(--el-color-danger);
            position: absolute;
            right: 0;
        }
    }
}
</style>
