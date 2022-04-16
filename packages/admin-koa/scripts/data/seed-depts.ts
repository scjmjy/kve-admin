import { ObjectId } from "bson";
import { DEPARTMENT_CONTAINER_ID, Gender, IDepartment, IRole, IUser, ROLE_SUPERADMIN_ID } from "admin-common";

interface InternalRole extends Omit<IRole, "_id" | "createdAt" | "updatedAt"> {
    _id: ObjectId;
}
/** 超级管理员 */
const _id_role_0 = new ObjectId(ROLE_SUPERADMIN_ID);
/** 通用角色 */
const _id_role_1 = new ObjectId(1);
/** 开发通用角色 */
const _id_role_2 = new ObjectId(2);
/** 项目主管负责人 */
const _id_role_3 = new ObjectId(3);
/** 项目主管 */
const _id_role_4 = new ObjectId(4);
/** 项目开发主管 */
const _id_role_5 = new ObjectId(5);
/** 项目开发人员 */
const _id_role_6 = new ObjectId(6);
/** 项目测试主管 */
const _id_role_7 = new ObjectId(7);
/** 项目测试人员 */
const _id_role_8 = new ObjectId(8);
/** 管理员 */
const _id_role_9 = new ObjectId(9);
/** 员工角色 */
const _id_role_10 = new ObjectId(10);
/** 部门A领导 */
const _id_role_11 = new ObjectId(11);
/** 部门A通用角色 */
const _id_role_12 = new ObjectId(12);
/** 部门B领导 */
const _id_role_13 = new ObjectId(13);
/** 部门B通用角色 */
const _id_role_14 = new ObjectId(14);
/** 部门A-1领导 */
const _id_role_15 = new ObjectId(15);
/** 部门A-1通用角色 */
const _id_role_16 = new ObjectId(16);
/** 部门A-2领导 */
const _id_role_17 = new ObjectId(17);
/** 部门A-2通用角色 */
const _id_role_18 = new ObjectId(18);
/** 部门B-1领导 */
const _id_role_19 = new ObjectId(19);
/** 部门B-1通用角色 */
const _id_role_20 = new ObjectId(20);

export const internalRoles: InternalRole[] = [
    {
        _id: _id_role_0,
        name: "超级管理员",
        orderNo: 0,
        description: "拥有所有系统权限，由开发公司中的负责人持有。",
        status: "enabled",
    },
    {
        _id: _id_role_1,
        name: "通用角色",
        orderNo: 0,
        description: "每个用户都可以拥有的角色。",
        status: "enabled",
    },
    {
        _id: _id_role_2,
        name: "开发通用角色",
        orderNo: 1,
        description: "开发公司的通用角色。",
        status: "enabled",
    },
    {
        _id: _id_role_3,
        name: "项目主管负责人",
        orderNo: 0,
        description: "由项目主管部门的负责人持有。",
        status: "enabled",
    },
    {
        _id: _id_role_4,
        name: "项目主管",
        orderNo: 1,
        description: "项目主管部门的通用角色。",
        status: "enabled",
    },
    {
        _id: _id_role_5,
        name: "项目开发主管",
        orderNo: 0,
        description: "由项目开发部门的负责人持有。",
        status: "enabled",
    },
    {
        _id: _id_role_6,
        name: "项目开发人员",
        orderNo: 1,
        description: "项目开发部门的通用角色。",
        status: "enabled",
    },
    {
        _id: _id_role_7,
        name: "项目测试主管",
        orderNo: 0,
        description: "由项目测试部门的负责人持有。",
        status: "enabled",
    },
    {
        _id: _id_role_8,
        name: "项目测试人员",
        orderNo: 1,
        description: "项目测试部门的通用角色。",
        status: "enabled",
    },
    {
        _id: _id_role_9,
        name: "管理员",
        orderNo: 0,
        description: "由甲方公司的负责人持有。",
        status: "enabled",
    },
    {
        _id: _id_role_10,
        name: "员工角色",
        orderNo: 1,
        description: "甲方公司的通用员工角色。",
        status: "enabled",
    },
    {
        _id: _id_role_11,
        name: "部门A领导",
        orderNo: 0,
        description: "由部门A的领导持有。",
        status: "enabled",
    },
    {
        _id: _id_role_12,
        name: "部门A通用角色",
        orderNo: 1,
        description: "部门A的通用角色。",
        status: "enabled",
    },
    {
        _id: _id_role_13,
        name: "部门B领导",
        orderNo: 0,
        description: "由部门B的领导持有。",
        status: "enabled",
    },
    {
        _id: _id_role_14,
        name: "部门B通用角色",
        orderNo: 1,
        description: "部门B的通用角色。",
        status: "enabled",
    },
    {
        _id: _id_role_15,
        name: "部门A-1领导",
        orderNo: 0,
        description: "由部门A-1的领导持有。",
        status: "enabled",
    },
    {
        _id: _id_role_16,
        name: "部门A-1通用角色",
        orderNo: 1,
        description: "部门A-1的通用角色。",
        status: "enabled",
    },
    {
        _id: _id_role_17,
        name: "部门A-2领导",
        orderNo: 0,
        description: "由部门A-2的领导持有。",
        status: "enabled",
    },
    {
        _id: _id_role_18,
        name: "部门A-2通用角色",
        orderNo: 1,
        description: "部门A-2的通用角色。",
        status: "enabled",
    },
    {
        _id: _id_role_19,
        name: "部门B-1领导",
        orderNo: 0,
        description: "由部门B-1的领导持有。",
        status: "enabled",
    },
    {
        _id: _id_role_20,
        name: "部门B-1通用角色",
        orderNo: 1,
        description: "部门B-1的通用角色。",
        status: "enabled",
    },
];

interface InternalDepartment
    extends Omit<IDepartment, "_id" | "roles" | "depts" | "managers" | "createdAt" | "updatedAt"> {
    roles: { _id: ObjectId }[];
    depts: { _id: ObjectId }[];
    _id: ObjectId;
}

/** 部门容器节点 */
const _id_dept_0 = new ObjectId(DEPARTMENT_CONTAINER_ID);
/** 开发公司 */
const _id_dept_1 = new ObjectId(1);
/** 项目主管部门 */
const _id_dept_2 = new ObjectId(2);
/** 项目开发部门 */
const _id_dept_3 = new ObjectId(3);
/** 项目测试部门 */
const _id_dept_4 = new ObjectId(4);
/** 甲方公司 */
const _id_dept_5 = new ObjectId(5);
/** 甲方公司 部门A */
const _id_dept_6 = new ObjectId(6);
/** 甲方公司 部门B */
const _id_dept_7 = new ObjectId(7);
/** 甲方公司 部门A-1 */
const _id_dept_8 = new ObjectId(8);
/** 甲方公司 部门A-2 */
const _id_dept_9 = new ObjectId(9);
/** 甲方公司 部门B-1 */
const _id_dept_10 = new ObjectId(10);

export const internalDepts: InternalDepartment[] = [
    {
        _id: _id_dept_0,
        name: "主节点",
        orderNo: 0,
        description: "部门主节点。",
        roles: [
            {
                _id: _id_role_1,
            },
        ],
        depts: [
            {
                _id: _id_dept_1,
            },
            {
                _id: _id_dept_5,
            },
        ],
        status: "enabled",
    },
    {
        _id: _id_dept_1,
        name: "开发公司",
        orderNo: 0,
        description: "开发公司的部门主节点。",
        roles: [
            {
                _id: _id_role_0,
            },
            {
                _id: _id_role_2,
            },
        ],
        depts: [
            {
                _id: _id_dept_2,
            },
            {
                _id: _id_dept_3,
            },
            {
                _id: _id_dept_4,
            },
        ],
        status: "enabled",
    },
    {
        _id: _id_dept_2,
        name: "项目主管部门",
        orderNo: 0,
        description: "开发公司中负责此项目的主管所在的部门。",
        roles: [
            {
                _id: _id_role_3,
            },
            {
                _id: _id_role_4,
            },
        ],
        depts: [],
        status: "enabled",
    },
    {
        _id: _id_dept_3,
        name: "项目开发部门",
        orderNo: 1,
        description: "负责开发此项目的开发人员所在的部门。",
        roles: [
            {
                _id: _id_role_5,
            },
            {
                _id: _id_role_6,
            },
        ],
        depts: [],
        status: "enabled",
    },
    {
        _id: _id_dept_4,
        name: "项目测试部门",
        orderNo: 2,
        description: "负责测试此项目的开发人员所在的部门。",
        roles: [
            {
                _id: _id_role_7,
            },
            {
                _id: _id_role_8,
            },
        ],
        depts: [],
        status: "enabled",
    },
    {
        _id: _id_dept_5,
        name: "甲方公司",
        orderNo: 1,
        description: "甲方公司的部门主节点。",
        roles: [
            {
                _id: _id_role_9,
            },
            {
                _id: _id_role_10,
            },
        ],
        depts: [
            {
                _id: _id_dept_6,
            },
            {
                _id: _id_dept_7,
            },
        ],
        status: "enabled",
    },
    {
        _id: _id_dept_6,
        name: "部门A",
        orderNo: 0,
        description: "部门A",
        roles: [
            {
                _id: _id_role_11,
            },
            {
                _id: _id_role_12,
            },
        ],
        depts: [
            {
                _id: _id_dept_8,
            },
            {
                _id: _id_dept_9,
            },
        ],
        status: "enabled",
    },
    {
        _id: _id_dept_7,
        name: "部门B",
        orderNo: 1,
        description: "部门B",
        roles: [
            {
                _id: _id_role_13,
            },
            {
                _id: _id_role_14,
            },
        ],
        depts: [
            {
                _id: _id_dept_10,
            },
        ],
        status: "enabled",
    },
    {
        _id: _id_dept_8,
        name: "部门A-1",
        orderNo: 0,
        description: "部门A-1",
        roles: [
            {
                _id: _id_role_15,
            },
            {
                _id: _id_role_16,
            },
        ],
        depts: [],
        status: "enabled",
    },
    {
        _id: _id_dept_9,
        name: "部门A-2",
        orderNo: 0,
        description: "部门A-2",
        roles: [
            {
                _id: _id_role_17,
            },
            {
                _id: _id_role_18,
            },
        ],
        depts: [],
        status: "enabled",
    },
    {
        _id: _id_dept_10,
        name: "部门B-1",
        orderNo: 1,
        description: "部门B-1",
        roles: [
            {
                _id: _id_role_19,
            },
            {
                _id: _id_role_20,
            },
        ],
        depts: [],
        status: "enabled",
    },
];

interface InternalUser extends Omit<IUser, "_id" | "avatar" | "thumb" | "roles" | "depts" | "createdAt" | "updatedAt"> {
    roles: { _id: ObjectId }[];
    depts: { _id: ObjectId }[];
}

export const internalUsers: InternalUser[] = [
    {
        username: "superadmin",
        realname: "Super Admin",
        password: "123456",
        email: "",
        mobileno: "",
        gender: Gender.UNKNOWN,
        status: "enabled",
        depts: [
            {
                _id: _id_dept_1,
            },
        ],
        roles: [
            {
                _id: _id_role_0,
            },
        ],
    },
    {
        username: "admin",
        realname: "Admin",
        password: "123456",
        email: "",
        mobileno: "",
        gender: Gender.UNKNOWN,
        status: "enabled",
        depts: [
            {
                _id: _id_dept_5,
            },
        ],
        roles: [
            {
                _id: _id_role_9,
            },
        ],
    },
];
