<template>
    <div class="deptProfile">
        <el-descriptions class="el-descriptions--custom" :column="1" border>
            <template #extra>
                <el-button-group size="small">
                    <el-button icon="Plus" type="primary" :loading="state.loading" @click="onAddClick"
                        >添加部门</el-button
                    >
                    <el-button
                        icon="Edit"
                        type="warning"
                        :loading="state.loading"
                        :disabled="dept.status !== 'enabled'"
                        @click="onEditClick"
                        >编辑</el-button
                    >
                    <el-button
                        icon="Delete"
                        type="danger"
                        :disabled="state.isContainerDept || dept.status === 'deleted'"
                        :loading="state.loading"
                        @click="updateDeptStatus('deleted')"
                        >删除</el-button
                    >
                    <el-button
                        icon="Check"
                        type="success"
                        :disabled="state.isContainerDept || dept.status === 'enabled'"
                        :loading="state.loading"
                        @click="updateDeptStatus('enabled')"
                        >启用</el-button
                    >
                    <el-button
                        icon="Close"
                        type="warning"
                        :disabled="state.isContainerDept || dept.status !== 'enabled'"
                        :loading="state.loading"
                        @click="updateDeptStatus('disabled')"
                        >禁用</el-button
                    >
                </el-button-group>
            </template>
            <el-descriptions-item label="部门名称">
                {{ dept.name }}
            </el-descriptions-item>
            <el-descriptions-item label="上级部门">
                {{ parent || "无" }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
                <StatusTag v-model="dept.status" />
            </el-descriptions-item>
            <el-descriptions-item label="描述">
                {{ dept.description }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
                {{ formatDate(dept.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
                {{ formatDate(dept.updatedAt) }}
            </el-descriptions-item>
        </el-descriptions>

        <CrudFormDlg
            v-model="state.showCrudFormDlg"
            :action="formAction"
            :actions="formActions"
            :column="1"
            :items="formItems"
            :form-data="formData"
            :rules="formRules"
        ></CrudFormDlg>
    </div>
</template>

<script setup lang="ts" name="DeptProfile">
import { computed, PropType, reactive, ref } from "vue";
import {
    DeptTreeNodesResult,
    CreateDeptBody,
    UpdateDeptBody,
    DEPARTMENT_CONTAINER_ID,
    getUpdateDeptRules,
    getCreateDeptRules,
} from "admin-common";
import { FormAction, FormActions, ItemSchema } from "@/components/form/CrudForm.vue";
import { createDept, updateDept, enableDept } from "@/api/department";
import { formatDate } from "@/utils/date";

const props = defineProps({
    parent: {
        type: String,
        default: undefined,
    },
    dept: {
        type: Object as PropType<DeptTreeNodesResult>,
        required: true,
    },
});

const emit = defineEmits(["create", "update", "status"]);

const state = reactive({
    loading: false,
    showCrudFormDlg: false,
    isContainerDept: computed(() => props.dept._id === DEPARTMENT_CONTAINER_ID),
});

const formData = ref({} as CreateDeptBody | UpdateDeptBody);

const formAction = ref<FormAction>();

const formActions = ref<FormActions>({
    apis: {
        async create() {
            state.loading = true;
            await createDept(formData.value as CreateDeptBody).finally(() => {
                state.loading = false;
            });
            state.showCrudFormDlg = false;
            emit("create", formData.value);
        },
        async read(action) {
            if (action === "update") {
                const { _id, name, description } = props.dept;
                formData.value = {
                    _id,
                    name,
                    description,
                };
            }
        },
        async update() {
            state.loading = true;
            await updateDept(formData.value as UpdateDeptBody).finally(() => {
                state.loading = false;
            });
            state.showCrudFormDlg = false;
            emit("update", formData.value);
        },
    },
});

const formItems = computed(() => {
    const items: ItemSchema[] = [
        {
            label: "部门名称",
            prop: "name",
            item: {
                type: "ElInput",
                props: {
                    clearable: true,
                },
            },
        },
        {
            label: "状态",
            prop: "status",
            visible: formAction.value === "read",
            item: {
                type: "StatusSelect",
                props: {},
            },
        },
        {
            label: "描述",
            prop: "description",
            item: {
                type: "ElInput",
                props: {
                    type: "textarea",
                    clearable: true,
                },
            },
        },
    ];
    return items;
});

const formRules = computed(() => {
    if (formAction.value === "create") {
        return getCreateDeptRules();
    }
    return getUpdateDeptRules();
});

function onAddClick() {
    formAction.value = "create";
    formData.value = {
        parent: props.dept._id,
    } as CreateDeptBody;
    state.showCrudFormDlg = true;
}

function onEditClick() {
    formAction.value = "update";
    state.showCrudFormDlg = true;
}

async function updateDeptStatus(status: EnableStatus) {
    state.loading = true;
    await enableDept(props.dept._id, status).finally(() => {
        state.loading = false;
    });
    props.dept.status = status;
    emit("status", props.dept._id, status);
}
</script>

<style scoped lang="scss">
.deptProfile {
}
</style>
