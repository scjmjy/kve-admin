import { IDepartment } from './department';
import { IRole } from './role';

export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    UNKNOWN = "UNKNOWN",
}

export interface LoginCredential {
    username: string;
    password: string;
}

export interface LoginResult {
    token: string;
    id: string;
}

export interface IUser {
    id: string;
    username: string;
    password: string;
    realname: string;
    gender: Gender;
    avatar: string;
    depts: IDepartment[];
    roles: IRole[];
    createdAt: number;
}

export type UserProfileResult = Omit<IUser, "password" | "createdAt">;
