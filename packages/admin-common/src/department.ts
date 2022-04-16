import { IUser } from './user';
import { IBase } from "./utils";
export interface IRole extends IBase {
    name: string;
    orderNo: number;
    description: string;
}

export const ROLE_SUPERADMIN_ID = "000000000000000000000000";

export interface IDepartment extends IBase {
    name: string;
    orderNo: number;
    roles: IRole[];
    depts: IDepartment[];
    description: string;
    managers: IUser[];
}

export const DEPARTMENT_CONTAINER_ID = "000000000000000000000000";

export interface DeptTreeNodesResult extends IDepartment {}
