<template>
    <div class="deptUserManage">
        <div class="deptUserManage-filter"></div>
        <div class="deptUserManage-header">
            <el-button-group>
                <el-button icon="Plus" type="primary" @click="onAddClick">新增</el-button>
                <el-button icon="Delete" type="danger">删除</el-button>
            </el-button-group>

            <el-button-group>
                <el-button plain icon="Plus" type="primary"></el-button>
                <el-button plain icon="Delete" type="danger"></el-button>
            </el-button-group>
        </div>
        <el-table
            class="deptUserManage-table"
            v-loading="state.loading"
            :data="crudTable.dataList"
            @selection-change="onSelectionChange"
            stripe
        >
            <!-- <el-table-column type="selection" width="50" align="center" /> -->
            <el-table-column v-for="col of crudTable.columns" v-bind="col.props" :key="col.props.prop">
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
            <el-table-column label="操作" align="center" width="130" class-name="el-table__column--action">
                <template #default="scope">
                    <el-button size="small" type="primary"> 详情 </el-button>
                    <el-dropdown @visible-change="scope.row.__dropdown = !scope.row.__dropdown">
                        <span class="el-dropdown-link">
                            更多
                            <el-icon :class="{ 'is-up': scope.row.__dropdown, 'el-icon__ani': true }"
                                ><arrow-down
                            /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item>编辑</el-dropdown-item>
                                <el-dropdown-item>删除</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>
        <CrudFormDlg
            v-model="state.isShowDlg"
            v-bind="crudForm"
            :form-data="formData"
            :title="crudDlg.title"
        ></CrudFormDlg>
    </div>
</template>

<script setup lang="ts" name="DeptUserManage">
import { computed, onMounted, PropType, reactive, ref, shallowReactive, watch } from "vue";
import {
    CreateUserBody,
    createUserRules,
    DeptTreeNodesResult,
    FindUsersParams,
    FindUsersResult,
    Gender,
} from "admin-common";
import { getUserList } from "@/api/user";
import { ElTableColumn } from "element-plus";
import CrudFormDlg from "@/components/dialog/CrudFormDlg.vue";
import { CrudFormProps, FormAction, ItemSchema } from "@/components/form/CrudForm.vue";
import { createUser } from "@/api/user";

export type TableColumnProps = InstanceType<typeof ElTableColumn>;

export interface CrudTableColumn<T> {
    props: Partial<TableColumnProps>;
    slot?: {
        name: string;
        props: Record<string, any> | ((row: T) => Record<string, any>);
    };
    transform?: (row: T) => string;
}

type DataListType = FindUsersResult["list"];
type DataType = DataListType[0];

const props = defineProps({
    dept: {
        type: Object as PropType<DeptTreeNodesResult>,
        required: true,
    },
});

function extractAllDepts(dept: DeptTreeNodesResult) {
    if (dept.depts.length) {
        const depts = [dept._id];
        for (const d of dept.depts) {
            depts.push(...extractAllDepts(d));
        }
        return depts;
    } else {
        return [dept._id];
    }
}

const state = reactive({
    loading: false,
    isShowDlg: false,
    allDepts: computed(() => {
        return extractAllDepts(props.dept);
    }),
});

const crudDlg = reactive({
    title: computed(() => {
        switch (crudForm.action) {
            case "create":
                return "新建";
            case "update":
                return "修改";
            case "read":
                return "详情";
            default:
                break;
        }
    }),
});

const crudTable = reactive({
    dataList: [] as FindUsersResult["list"],
    columns: [
        {
            props: {
                prop: "thumbnail",
                label: "头像",
                align: "center",
                width: 70,
            },
            slot: {
                name: "ElAvatar",
                props: (row) => {
                    return {
                        src: row.thumbnail,
                    };
                },
            },
        },
        {
            props: {
                prop: "username",
                label: "用户名",
                showOverflowTooltip: true,
            },
        },
        {
            props: {
                prop: "realname",
                label: "真实姓名",
                showOverflowTooltip: true,
            },
        },
        {
            props: {
                prop: "mobileno",
                label: "手机号码",
                showOverflowTooltip: true,
            },
        },
        {
            props: {
                prop: "email",
                label: "邮箱",
                showOverflowTooltip: true,
            },
        },
        {
            props: {
                prop: "depts",
                label: "所属部门",
                showOverflowTooltip: true,
            },
            transform(row) {
                return row.depts.map((dept) => dept.name).join("，");
            },
        },
        {
            props: {
                prop: "status",
                label: "状态",
            },
            slot: {
                name: "ReadonlySwitch",
                props: {
                    "active-value": "enabled",
                    "inactive-value": "disabled",
                },
            },
        },
        {
            props: {
                prop: "createdAt",
                label: "创建时间",
                showOverflowTooltip: true,
            },
        },
    ] as CrudTableColumn<DataType>[],
});

const formData = reactive({} as CreateUserBody);

const crudForm = shallowReactive<Omit<CrudFormProps, "formData">>({
    action: "create",
    column: 2,
    rules: createUserRules,
    actions: {
        apis: {
            async create() {
                await createUser(formData);
                state.isShowDlg = false;
            },
        },
    },
    items: [
        {
            label: "用户名",
            prop: "username",
            item: {
                type: "ElInput",
                props: {
                    clearable: true,
                },
            },
        },
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
            label: "密码",
            prop: "password",
            item: {
                type: "ElInput",
                props: {
                    type: "password",
                    showPassword: true,
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
        {
            label: "所属部门",
            prop: "depts",
            item: {
                type: "ElTreeSelect",
                props: {
                    props: {
                        label: "name",
                        value: "_id",
                        children: "depts",
                    },
                    data: [props.dept],
                    checkStrictly: true,
                    multiple: true,
                },
            },
        },
    ],
});

watch(
    () => state.allDepts,
    (depts) => {
        const params: FindUsersParams = {
            pageNum: 1,
            pageSize: 10,
            filter: {
                depts: {
                    comparison: "in",
                    value: depts,
                },
            },
        };

        getUserList(params).then((res) => {
            crudTable.dataList = res.data.list;
        });
    },
    {
        immediate: true,
    },
);

function onAddClick() {
    state.isShowDlg = true;
}

function onSelectionChange() {}
</script>

<style scoped lang="scss">
.deptUserManage {
    &-header {
        display: flex;
        justify-content: space-between;
    }
    &-table {
        margin-top: 10px;
    }
}
</style>
