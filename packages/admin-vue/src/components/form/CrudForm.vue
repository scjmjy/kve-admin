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
            <template v-for="item in items" :key="item.prop">
                <el-col v-if="item.visible !== false" :span="Math.max(item.span || 0, state.span)">
                    <el-form-item
                        :label="item.label"
                        :prop="item.prop"
                        v-bind="Object.assign($options.props.formItemProps.default(), formItemProps, item.attrs)"
                    >
                        <template v-if="item.tooltip" #label>
                            <el-tooltip placement="top" v-bind="(item.tooltip as any)">
                                <SvgIcon
                                    icon="QuestionFilled"
                                    style="vertical-align: -2px; margin-right: 2px"
                                ></SvgIcon>
                            </el-tooltip>
                            <span>
                                {{ item.label }}
                            </span>
                        </template>
                        <component
                            v-model="formData[item.prop]"
                            :is="item.item.type"
                            :readonly="state.readonly"
                            v-bind="item.item.props"
                        ></component>
                    </el-form-item>
                </el-col>
                <el-col v-if="item.break" :span="24"></el-col>
            </template>
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
                <el-button-group class="crudForm-actions-extra" size="small">
                    <el-button
                        v-if="action === 'read' && formActions.editable"
                        plain
                        type="warning"
                        @click="handleEdit"
                        >{{ formActions.labels.edit }}</el-button
                    >
                    <el-button
                        v-if="action === 'read' && formActions.deletable"
                        plain
                        type="danger"
                        @click="handleDelete"
                        >{{ formActions.labels.delete }}</el-button
                    >
                </el-button-group>
            </div>
            <slot v-else name="actions" class="crudForm-actions"></slot>
        </template>
    </el-form>
</template>

<script setup lang="ts" name="CrudForm">
import { computed, getCurrentInstance, nextTick, onMounted, PropType, reactive, ref, watch } from "vue";
import { ElForm, ElMessage, ElMessageBox, UploadInstance, useTooltipProps } from "element-plus";
import type {
    FormProps,
    FormItemProps,
    FormRules,
    InputInstance,
    ElSelect,
    SwitchInstance,
    ElTree,
    ElDatePicker,
    ElSwitch,
    RadioGroupProps,
    RadioGroupEmits,
    TooltipInstance,
} from "element-plus";
import { merge } from "lodash-es";
import { ResponsiveScreenMap, ScreenMode, useSystemStore } from "@/store/modules/system";
import { useInvalidProps } from "@/composables/useForm";
import type ReadonlySwitch from "@/components/form/ReadonlySwitch.vue";
import type MenuTypeRadio from "@/components/form/MenuTypeRadio.vue";
import type { BasicSelectProps } from "./BasicSelect.vue";
import type PathInput from "./PathInput.vue";
import type IconSelectInput from "./IconSelectInput.vue";
import type { BasicTreeSelectProps } from "./BasicTreeSelect.vue";
import type { BasicUploadProps } from "./BasicUpload.vue";

export type CrudFormItem =
    | {
          type: "ElInput";
          props?: InputInstance["$props"];
      }
    | {
          type: "PathInput";
          props?: InstanceType<typeof PathInput>["$props"] & InputInstance["$props"];
      }
    | {
          type: "IconSelectInput";
          props?: InstanceType<typeof IconSelectInput>["$props"] & InputInstance["$props"];
      }
    | {
          type: "ElSwitch";
          props?: InstanceType<typeof ElSwitch>["$props"];
      }
    | {
          type: "ElDatePicker";
          props?: InstanceType<typeof ElDatePicker>["$props"];
      }
    | {
          type: "BasicSelect";
          props?: BasicSelectProps & InstanceType<typeof ElSelect>["$props"];
      }
    | {
          type: "GenderSelect";
          props?: Omit<BasicSelectProps, "options"> & InstanceType<typeof ElSelect>["$props"];
      }
    | {
          type: "BasicUpload";
          props?: BasicUploadProps & Omit<UploadInstance["$props"], "action" | "accept" | "list-type">;
      }
    | {
          type: "StatusSelect";
          props?: Omit<BasicSelectProps, "options"> & InstanceType<typeof ElSelect>["$props"];
      }
    | {
          type: "BasicTreeSelect";
          props?: BasicTreeSelectProps &
              InstanceType<typeof ElSelect>["$props"] &
              InstanceType<typeof ElTree>["$props"];
      }
    | {
          type: "ReadonlySwitch";
          props?: InstanceType<typeof ReadonlySwitch>["$props"] & SwitchInstance["$props"];
      }
    | {
          type: "MenuTypeRadio";
          props?: InstanceType<typeof MenuTypeRadio>["$props"] & RadioGroupProps & RadioGroupEmits;
      };

// export interface CrudFormItem {
//     type: string;
//     props?: Record<string, any>;
// }

export interface ItemSchema {
    label: string;
    tooltip?: TooltipInstance["$props"];
    prop: string;
    span?: number;
    /** 是否换行 */
    break?: boolean;
    attrs?: Record<string, any>;
    /** 是否显示此 FormItem，默认 true */
    visible?: boolean;
    item: CrudFormItem;
}

export type FormAction = "create" | "read" | "update";

export type ApiFn = () => Promise<any>;
export type ReadApiFn = (forAction: "read" | "update") => Promise<any>;

export interface FormActions {
    /** 是否显示底部的 “返回” “更新” “提交” 等按钮 */
    show?: boolean;
    /** 是否显示 “删除” 按钮；如果是 string 类型，则会把 formData[deletable] 作为名称 */
    deletable?: boolean | string;
    editable?: boolean;
    labels?: { [k in FormAction | "edit" | "delete"]: string };
    apis?: {
        [k in "create" | "update" | "delete"]?: ApiFn;
    } & {
        read?: ReadApiFn;
    };
}

export interface CrudFormProps {
    column?: number | Partial<Record<ScreenMode, number>> | "responsive";
    action?: FormAction;
    actions?: FormActions;
    formData?: Record<string, any>;
    formProps?: Partial<FormProps>;
    formItemProps?: Partial<FormItemProps>;
    rules?: FormRules;
    items?: ItemSchema[];
}

export interface CrudFormEmits {
    (event: "change", formData: Record<string, any>): void;
    (event: "formaction", action: FormAction | "delete" | "back", err?: any): void;
    (event: "update:action", action: FormAction): void;
}

const instance = getCurrentInstance();
const props = withDefaults(defineProps<CrudFormProps>(), {
    column: "responsive",
    action: "read",
    actions: () => ({
        show: true,
        deletable: true,
        editable: true,
        labels: {
            create: "提交",
            read: "返回",
            update: "更新",
            edit: "编辑",
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

const emit = defineEmits<CrudFormEmits>();

const { invalid, invalidProps, onValidate, resetValidation } = useInvalidProps(props.formData, props.rules, false);

function resetFormValidation() {
    resetValidation(props.formData, props.rules);
}

onMounted(() => {
    watch(
        () => props.action,
        async (action) => {
            switch (action) {
                case "create":
                    break;
                case "read":
                    const readApi = formActions.value.apis[action];
                    if (readApi) {
                        state.loading = true;
                        await readApi(action).finally(() => {
                            state.loading = false;
                        });
                        resetFormValidation();
                    }
                    break;
                case "update":
                    const readApiForUpdate = formActions.value.apis["read"];
                    if (readApiForUpdate) {
                        state.loading = true;
                        await readApiForUpdate(action).finally(() => {
                            state.loading = false;
                        });
                        resetFormValidation();
                    }
                    refForm.value?.validate();
                    break;
            }
            state.changed = false;
        },
        {
            immediate: true,
        },
    );

    watch(
        () => [props.items, props.rules],
        () => {
            resetFormValidation();
        },
        {
            immediate: true,
        },
    );
});

const formActions = computed<Required<FormActions>>(() => {
    const defaultActions = instance!.proxy!.$options.props.actions.default();
    merge(defaultActions, props.actions);
    return defaultActions;
});

const systemStore = useSystemStore();

const state = reactive({
    loading: false,
    span: computed(() => {
        if (props.column === "responsive") {
            switch (systemStore.screen.mode) {
                case "xl":
                case "lg":
                    return 8;
                case "md":
                case "sm":
                    return 12;
                default:
                    return 24;
            }
        } else if (typeof props.column === "object") {
            return 24 / (props.column[systemStore.screen.mode] || 2);
        } else {
            return 24 / props.column;
        }
    }),
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
    (data) => {
        state.changed = true;
        emit("change", data);
    },
    {
        deep: true,
    },
);

const refForm = ref<InstanceType<typeof ElForm>>();

function handleAction() {
    switch (props.action) {
        case "read":
            emit("formaction", "back");
            break;
        case "create":
        case "update":
            refForm.value?.validate((isValid) => {
                if (isValid) {
                    const api = formActions.value.apis[props.action] as ApiFn;
                    if (api) {
                        state.loading = true;
                        api()
                            .then(() => {
                                emit("formaction", props.action);
                            })
                            .catch((err) => {
                                console.error("[CrudForm] handleAction error:", err);
                                emit("formaction", props.action, err);
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
async function handleDelete() {
    const { deletable } = formActions.value;
    const which = typeof deletable === "string" ? `【${props.formData[deletable]}】` : "";
    const api = formActions.value.apis["delete"];
    if (!api) {
        return;
    }
    await ElMessageBox.confirm(`你确定删除${which}吗？`, "温馨提示");
    state.loading = true;
    api()
        .then(() => {
            emit("formaction", "delete");
        })
        .catch((err) => {
            console.error("[CrudForm] handleDelete error:", err);
            emit("formaction", "delete", err);
        })
        .finally(() => {
            state.loading = false;
        });
}

function handleEdit() {
    emit("update:action", "update");
}

defineExpose({
    state,
    resetFormValidation,
    handleAction,
    handleDelete,
    handleEdit,
});
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

        &-extra {
            color: var(--el-color-danger);
            position: absolute;
            right: 0;
        }
    }
}
</style>
