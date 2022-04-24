<template>
    <div class="crudTable">
        <div class="crudTable-filter">
            <CrudForm
                action="create"
                :column="filterColumn"
                :form-data="filterFormData"
                :items="filterItems"
                :actions="{ show: false }"
                @change="onFilterChangeDebounce"
            ></CrudForm>
        </div>
        <div class="crudTable-header">
            <slot class="crudTable-title" name="title"></slot>
            <span class="crudTable-title" v-if="!$slots.title && header && header.title"> {{ header.title }} </span>
            <el-button-group class="crudTable-actions" size="small">
                <el-button
                    v-if="header && header.onAddClick"
                    icon="Plus"
                    type="primary"
                    :loading="state.loading"
                    @click="onAddClick"
                    >新增</el-button
                >
                <el-button
                    v-if="header && header.onDeleteManyClick"
                    icon="Delete"
                    type="danger"
                    :disabled="selection.length === 0"
                    :loading="state.loading"
                    @click="onDeleteManyClick"
                    >删除</el-button
                >
                <slot name="header-actions"></slot>
            </el-button-group>

            <el-button-group>
                <el-tooltip effect="dark" :content="state.hasSelection ? '取消多选框' : '显示多选框'" placement="top">
                    <el-button
                        v-if="header && header.selection"
                        plain
                        :icon="state.hasSelection ? 'Minus' : 'Finished'"
                        circle
                        type="success"
                        @click="onMultiSelectClick"
                    ></el-button>
                </el-tooltip>

                <el-tooltip effect="dark" content="刷新数据" placement="top">
                    <el-button plain icon="Refresh" circle type="primary" @click="onRefreshClick"></el-button>
                </el-tooltip>
                <el-tooltip effect="dark" content="清除筛选" placement="top">
                    <el-button
                        v-if="filterItems && filterItems.length"
                        plain
                        icon="Close"
                        circle
                        type="danger"
                        @click="onClearFilterClick"
                    ></el-button>
                </el-tooltip>
                <slot name="header-settings"></slot>
            </el-button-group>
        </div>
        <el-table
            ref="refTable"
            class="crudTable-table"
            v-loading="state.loading"
            :data="pageController.list"
            stripe
            @selection-change="onSelectionChange"
            v-bind="$attrs"
        >
            <el-table-column
                v-if="state.hasSelection"
                type="selection"
                width="50"
                align="center"
                v-bind="header?.selection"
            />
            <el-table-column v-for="col of columns" v-bind="col.props" :key="col.props.prop">
                <template v-if="col.slot" #default="scope">
                    <component
                        :is="col.slot!.name"
                        v-model="scope.row[col.props.prop as string]"
                        v-bind="typeof col.slot!.props === 'function' ? col.slot!.props(scope.row) : col.slot!.props"
                    ></component>
                </template>
                <template v-else-if="col.transform" #default="scope">
                    {{ col.transform(scope.row) }}
                </template>
            </el-table-column>
            <el-table-column v-if="actions" v-bind="actions.props" class-name="el-table__column--action">
                <template #default="scope">
                    <template v-if="actions.buttons">
                        <el-button
                            v-for="btn of actions.buttons!"
                            :key="btn.label"
                            v-bind="typeof btn.props === 'function' ? btn.props(scope.row) : btn.props"
                            @click="btn.onClick(scope.row)"
                        >
                            {{ btn.label }}
                        </el-button>
                    </template>
                    <el-dropdown
                        v-if="actions.dropdowns && actions.dropdowns.items.length"
                        @visible-change="scope.row.__dropdown = !scope.row.__dropdown"
                        @command="actions.dropdowns!.onCommand($event, scope.row)"
                    >
                        <span class="el-dropdown-link">
                            {{ actions.dropdowns.more }}
                            <el-icon :class="{ 'is-up': scope.row.__dropdown, 'el-icon__ani': true }"
                                ><arrow-down
                            /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item
                                    v-for="item in actions.dropdowns.items"
                                    :key="item.label"
                                    v-bind="typeof item.props === 'function' ? item.props(scope.row) : item.props"
                                    >{{ item.label }}</el-dropdown-item
                                >
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination
            class="crudTable-pagination"
            small
            background
            layout="total, sizes, prev, pager, next, jumper"
            v-model:page-size="pageController.pageSize"
            v-model:current-page="pageController.pageNum"
            :total="pageController.total"
        />
        <CrudFormDlg
            v-if="formData && formItems"
            :model-value="showCrudFormDlg"
            @update:model-value="onUpdateShowCrudFormDlg"
            :column="formColumn"
            :action="formAction"
            :actions="formActions"
            :items="formItems"
            :form-data="formData"
            :rules="formRules"
            @change="onFormChange"
            @formaction="onFormAction"
            @update:action="onUpdateAction"
        ></CrudFormDlg>
    </div>
</template>

<script setup lang="ts" name="CrudTable">
import { PropType, reactive, ref, watch } from "vue";
import { ButtonInstance, ElTable, ElTableColumn, ElDropdownItem, ElMessageBox } from "element-plus";
import { debounce } from "lodash";
import CrudFormDlg from "@/components/dialog/CrudFormDlg.vue";
import { ColumnResponsive, CrudFormProps, FormAction, ItemSchema } from "@/components/form/CrudForm.vue";
import { PageController } from "@/utils/page-controller";

export type TableColumnProps = InstanceType<typeof ElTableColumn>;

export interface CrudTableColumn<T> {
    props: Partial<TableColumnProps>;
    slot?: {
        name: string;
        /** TODO: 像 CrudFormItem.props 一样 */
        props?: Record<string, any> | ((row: T) => Record<string, any>);
    };
    transform?: (row: T) => string;
}

export interface TableHeader<T> {
    title: string;
    onAddClick(): void;
    onDeleteManyClick(selection: Array<T>): Promise<void>;
    selection?: Partial<TableColumnProps>;
}

export type DropdownItemProps = Partial<InstanceType<typeof ElDropdownItem>>;
export type ActionButtonProps = Partial<Omit<ButtonInstance, "onClick">>;
export interface TableActionColumn<T> {
    props: Partial<TableColumnProps>;
    buttons?: {
        label: string;
        onClick(row: T): void;
        props: ActionButtonProps | ((row: T) => ActionButtonProps);
    }[];
    dropdowns?: {
        more: string;
        onCommand(command: string, row: T): any;
        items: {
            label: string;
            props: DropdownItemProps | ((row: T) => DropdownItemProps);
        }[];
    };
}

const props = defineProps({
    header: {
        type: Object as PropType<TableHeader<any>>,
        default: undefined,
    },
    selection: {
        type: Array,
        default: () => reactive([]),
    },
    columns: {
        type: Array as PropType<CrudTableColumn<any>[]>,
        required: true,
    },
    actions: {
        type: Object as PropType<TableActionColumn<any>>,
        default: undefined,
    },
    requestApi: {
        type: Function as PropType<PageController<any, any>["requestApi"]>,
        required: true,
    },
    postHandler: {
        type: Function as PropType<PageController<any, any>["postHandler"]>,
        default: undefined,
    },
    filterColumn: {
        type: Object as PropType<ColumnResponsive>,
        default: () => ({
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 6,
        }),
    },
    filterFormData: {
        type: Object as PropType<Record<string, any>>,
        default: undefined,
    },
    filterItems: {
        type: Array as PropType<ItemSchema[]>,
        default: undefined,
    },
    filter: {
        type: Object as PropType<PageController<any, any>["filter"]>,
        default: undefined,
    },
    onFilterChange: {
        type: Function as PropType<(filterData: Record<string, any>) => any>,
        default: undefined,
    },
    formData: {
        type: Object as PropType<Record<string, any>>,
        default: undefined,
    },
    formColumn: {
        type: [String, Number, Object] as PropType<CrudFormProps["column"]>,
    },
    formAction: {
        type: String as PropType<CrudFormProps["action"]>,
    },
    formActions: {
        type: Object as PropType<CrudFormProps["actions"]>,
    },
    formRules: {
        type: Object as PropType<CrudFormProps["rules"]>,
    },
    formItems: {
        type: Array as PropType<CrudFormProps["items"]>,
    },
    showCrudFormDlg: {
        type: Boolean,
        default: false,
    },
});

interface CrudTableEmits {
    (event: "formchange", formData: Record<string, any>): void;
    (event: "formaction", action: FormAction | "delete" | "back", err?: any): void;
    (event: "update:formAction", action: FormAction): void;
    (event: "update:showCrudFormDlg", shown: boolean): void;
}

const emit = defineEmits<CrudTableEmits>();

const state = reactive({
    loading: false,
    hasSelection: false,
});

const onFilterChangeDebounce = debounce(
    function (filterData: Record<string, any>) {
        if (props.onFilterChange) {
            props.onFilterChange(filterData);
        }
    },
    200,
    {
        leading: true,
    },
);

const pageController = ref(new PageController(props.requestApi, props.postHandler, props.filter));

function navigateToPage(pageNum?: number) {
    state.loading = true;
    return pageController.value.navigateTo(pageNum).finally(() => {
        state.loading = false;
    });
}

watch(
    () => [pageController.value.pageNum, pageController.value.pageSize],
    ([pageNum, pageSize]) => {
        navigateToPage(pageNum);
    },
    {
        immediate: true,
    },
);

watch(
    () => [props.requestApi, props.postHandler, props.filter],
    ([requestApi, postHandler, filter]) => {
        pageController.value.requestApi = requestApi as PageController<any, any>["requestApi"];
        pageController.value.postHandler = postHandler as PageController<any, any>["postHandler"];
        pageController.value.filter = filter as PageController<any, any>["filter"];
        if (pageController.value.pageNum === 1) {
            navigateToPage(1);
        } else {
            pageController.value.pageNum = 1;
        }
    },
    { deep: true },
);

function onFormAction(action: FormAction | "delete" | "back", err?: any) {
    if (!err) {
        switch (action) {
            case "create":
            case "delete":
            case "update":
                navigateToPage();
                break;
            default:
                break;
        }
    }
    emit("formaction", action, err);
}

function onUpdateShowCrudFormDlg(show: boolean) {
    emit("update:showCrudFormDlg", show);
}
function onFormChange(formData: Record<string, any>) {
    emit("formchange", formData);
}
function onUpdateAction(action: FormAction) {
    emit("update:formAction", action);
}

function onAddClick() {
    const { onAddClick } = props.header || {};
    if (onAddClick) {
        onAddClick();
        emit("update:formAction", "create");
        emit("update:showCrudFormDlg", true);
    }
}
async function onDeleteManyClick() {
    const { onDeleteManyClick } = props.header || {};
    if (onDeleteManyClick) {
        const { deletable } = props.formActions || {};

        let which = "";
        if (typeof deletable === "string") {
            const names: string[] = [];
            props.selection.forEach((item: any) => {
                names.push(item[deletable]);
            });
            which = `【${names.join(", ")}】`;
        }
        await ElMessageBox.confirm(`你确定删除${which}吗？`, "温馨提示");
        state.loading = true;
        await onDeleteManyClick(props.selection).finally(() => {
            state.loading = false;
        });
        navigateToPage();
    }
}
const refTable = ref<InstanceType<typeof ElTable>>();
function onMultiSelectClick() {
    state.hasSelection = !state.hasSelection;
    refTable.value?.clearSelection();
}
function onRefreshClick() {
    navigateToPage(1);
}
function onClearFilterClick() {
    if (props.filterFormData) {
        for (const key in props.filterFormData) {
            delete props.filterFormData[key];
        }
    }
}
function onSelectionChange(selected: Array<any>) {
    props.selection.length = 0;
    props.selection.push(...selected);
}

defineExpose({
    navigateToPage,
    // state,
    // pageController,
});
</script>

<style scoped lang="scss">
.crudTable {
    &-filter {
        border-bottom: 1px solid var(--el-border-color);
        margin-bottom: 10px;
    }
    &-header {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
    }
    &-title {
        font-size: bold;
    }
    &-actions {
        margin-left: 20px;
        margin-right: auto;
    }
    &-table {
        width: 100%;
    }
    &-pagination {
        margin-top: 5px;
        justify-content: flex-end;
    }
}
</style>
