import { IRole } from './role';
export interface IDepartment {
    id: string;
    name: string;
    createdAt: number;
    roles: IRole[];
    depts: IDepartment[];
    description: string;
}
