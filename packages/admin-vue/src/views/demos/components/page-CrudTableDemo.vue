<template>
    <div>
        <CrudTable
            ref="crudTable"
            v-model:showCrudFormDlg="state.showCrudFormDlg"
            v-model:formAction="crudForm.action"
            :header="tableHeader"
            :request-api="getDemoCollectionList"
            :post-handler="postHandler"
            :actions="tableActions"
            :columns="tableColumns"
            :selection="state.tableSelection"
            :filter-form-data="filterFormData"
            :filter-items="filterItems"
            :filter="tableFilter"
            :on-filter-change="onFilterChange"
            :form-data="formData"
            :form-items="formItems"
            :form-rules="formRules"
            :form-actions="crudForm.actions"
        >
            <template #header-actions>
                <el-button
                    icon="Check"
                    type="success"
                    :loading="state.loading"
                    :disabled="state.tableSelection.length === 0"
                    @click="onXXXClick"
                    >XXX</el-button
                >
            </template>
        </CrudTable>
    </div>
</template>

<script setup lang="ts" name="CrudTableDemo">
import { computed, PropType, reactive, ref, shallowReactive, shallowRef, watch } from "vue";
import {
    getCreateDemoCollRules,
    getUpdateDemoCollRules,
    FindDemoCollectionResult,
    DemoCollectionFilter,
} from "admin-common";
import { ElMessage, ElMessageBox } from "element-plus";
import { isEmpty } from "lodash";
import {
    getDemoCollectionList,
    getDemoCollection,
    createDemoCollection,
    updateDemoCollection,
    deleteDemoCollection,
    CreateDemoCollectionBodyVue,
    UpdateDemoCollectionBodyVue,
} from "@/api/demo-collection";
import { CrudFormProps, ItemSchema } from "@/components/form/CrudForm.vue";
import CrudTable, { CrudTableColumn, TableActionColumn, TableHeader } from "@/components/table/CrudTable.vue";
import { formatDate } from "@/utils/date";

type DataListType = FindDemoCollectionResult["list"];
type DataType = DataListType[0];

const crudTable = ref<InstanceType<typeof CrudTable>>();

const state = reactive({
    loading: false,
    showCrudFormDlg: false,
    tableSelection: [] as DataType[],
});

const tableHeader = computed<TableHeader<DataType>>(() => {
    return {
        title: "DemoCollection 列表",
        selection: {},
        onAddClick() {
            formData.value = {
                field4: [] as string[],
            } as unknown as CreateDemoCollectionBodyVue;
            crudForm.action = "create";
            state.showCrudFormDlg = true;
        },
        async onDeleteManyClick(selection: DataType[]) {
            // const ids = selection.map((user) => user._id);
            ElMessage.warning("多项删除功能：未实现...");
        },
    };
});

async function onXXXClick() {
    ElMessage.warning("XXX功能：未实现...");
}

let currentDemoCollId: Undefinable<string>;

function postHandler(list: DataType[]) {
    list.forEach((item) => {
        item.createdAt = formatDate(item.createdAt);
        item.updatedAt = formatDate(item.updatedAt);
    });
}

type FilterFormData = Partial<Record<DemoCollectionFilter, any>>;
const filterFormData = reactive<FilterFormData>({});

const filterItems: ItemSchema[] = [
    {
        label: "field1",
        prop: "field1",
        item: {
            type: "ElInput",
            props: {
                type: "number",
                clearable: true,
            },
        },
    },
    {
        label: "field2",
        prop: "field2",
        item: {
            type: "ElInput",
            props: {
                clearable: true,
            },
        },
    },
    {
        label: "创建日期",
        prop: "createdAt",
        span: 12,
        item: {
            type: "ElDatePicker",
            props: {
                clearable: true,
                type: "daterange",
                startPlaceholder: "开始日期",
                endPlaceholder: "结束日期",
            },
        },
    },
];

const tableFilter = ref<Partial<PaginationFilter<DemoCollectionFilter>>>({});

function onFilterChange(filterData: FilterFormData) {
    tableFilter.value = {};

    let key: keyof FilterFormData;
    for (key in filterData) {
        const value = filterData[key];
        if (isEmpty(value)) {
            delete tableFilter.value[key];
        } else if (Array.isArray(value)) {
            tableFilter.value[key] = {
                comparison: "range",
                value,
            };
        } else if (key === "field1") {
            tableFilter.value[key] = {
                comparison: "gte",
                value: +value,
            };
        } else {
            tableFilter.value[key] = {
                comparison: "regex",
                value,
            };
        }
    }
}

const tableColumns = shallowRef<CrudTableColumn<DataType>[]>([
    {
        props: {
            prop: "field1",
            label: "field1",
            align: "center",
        },
    },
    {
        props: {
            prop: "field2",
            label: "field2",
            align: "center",
        },
    },
    {
        props: {
            prop: "field3",
            label: "field3",
            align: "center",
        },
        transform(row) {
            return row.field3.join(", ");
        },
    },
    {
        props: {
            prop: "field4",
            label: "field4",
            align: "center",
        },
        transform(row) {
            return row.field4.join(", ");
        },
    },
    {
        props: {
            prop: "createdAt",
            label: "创建时间",
            showOverflowTooltip: true,
        },
    },
    {
        props: {
            prop: "updatedAt",
            label: "更新时间",
            showOverflowTooltip: true,
        },
    },
]);

const tableActions = shallowRef<TableActionColumn<DataType>>({
    props: {
        label: "操作",
        align: "center",
        width: "130px",
    },
    buttons: [
        {
            label: "详情",
            onClick(row) {
                currentDemoCollId = row._id;
                crudForm.action = "read";
                state.showCrudFormDlg = true;
            },
            props: {
                type: "primary",
                text: true,
            },
        },
    ],
    dropdowns: {
        more: "更多",
        onCommand(command, row) {
            switch (command) {
                case "edit":
                    currentDemoCollId = row._id;
                    crudForm.action = "update";
                    state.showCrudFormDlg = true;
                    break;
                case "delete":
                    ElMessageBox.confirm(`你确定删除【${row.field2}】吗？`, "温馨提示").then(() => {
                        deleteDemoCollection(row._id).then(() => {
                            crudTable.value?.navigateToPage();
                        });
                    });

                    break;

                default:
                    break;
            }
        },
        items: [
            {
                label: "编辑",
                props: {
                    command: "edit",
                },
            },
            {
                label: "删除",
                props: {
                    command: "delete",
                },
            },
        ],
    },
});

const formData = ref({} as CreateDemoCollectionBodyVue | UpdateDemoCollectionBodyVue);

const crudForm = shallowReactive<Omit<CrudFormProps, "column" | "formData">>({
    action: "create",
    actions: {
        deletable: "field2",
        apis: {
            async create() {
                await createDemoCollection(formData.value);
                state.showCrudFormDlg = false;
            },
            async read() {
                const res = await getDemoCollection(currentDemoCollId!);
                formData.value = res.data;
            },
            async update() {
                await updateDemoCollection(formData.value as UpdateDemoCollectionBodyVue);
                state.showCrudFormDlg = false;
            },
            async delete() {
                await deleteDemoCollection((formData.value as UpdateDemoCollectionBodyVue)._id);
                state.showCrudFormDlg = false;
            },
        },
    },
});

const formRules = computed(() => {
    if (crudForm.action === "create") {
        return getCreateDemoCollRules();
    } else if (crudForm.action === "update") {
        return getUpdateDemoCollRules();
    }
});

const formItems = computed<ItemSchema[]>(() => {
    const items: ItemSchema[] = [
        {
            label: "field1",
            prop: "field1",
            item: {
                type: "ElInput",
                props: {
                    type: "number",
                    clearable: true,
                    onInput(val: string) {
                        if (val) {
                            formData.value.field1 = +val;
                        }
                    },
                },
            },
        },
        {
            label: "field2",
            prop: "field2",
            item: {
                type: "ElInput",
                props: {
                    clearable: true,
                },
            },
        },
        {
            label: "field3",
            prop: "field3",
            item: {
                type: "BasicSelect",
                props: {
                    multiple: true,
                    clearable: true,
                    options: [
                        {
                            label: "1",
                            value: 1,
                        },
                        {
                            label: "2",
                            value: 2,
                        },
                        {
                            label: "3",
                            value: 3,
                        },
                    ],
                },
            },
        },
        {
            label: "field4",
            prop: "field4",
            item: {
                type: "BasicSelect",
                props: {
                    multiple: true,
                    clearable: true,
                    options: [
                        {
                            label: "x",
                            value: "x",
                        },
                        {
                            label: "y",
                            value: "y",
                        },
                        {
                            label: "z",
                            value: "z",
                        },
                    ],
                },
            },
            break: true,
        },
        {
            label: "inlineFile",
            prop: "inlineFile",
            span: 8,
            item: {
                type: "BasicUpload",
                props: {
                    limit: 1,
                },
            },
        },
        {
            label: "inlineFileList",
            prop: "inlineFileList",
            span: 16,
            item: {
                type: "BasicUpload",
                props: {
                    limit: 3,
                },
            },
        },
        {
            label: "gridFsFile",
            prop: "gridFsFile",
            span: 8,
            item: {
                type: "BasicUpload",
                props: {
                    limit: 1,
                },
            },
        },
        {
            label: "gridFsFileList",
            prop: "gridFsFileList",
            span: 16,
            item: {
                type: "BasicUpload",
                props: {
                    limit: 3,
                },
            },
        },
    ];

    if (crudForm.action === "read") {
        items.push({
            label: "创建时间",
            prop: "createdAt",
            item: {
                type: "ElInput",
            },
        });
        items.push({
            label: "更新时间",
            prop: "updatedAt",
            item: {
                type: "ElInput",
            },
        });
    }
    return items;
});
</script>

<style scoped lang="scss"></style>
