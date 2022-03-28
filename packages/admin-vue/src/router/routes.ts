import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";

const PUBLIC_PATH = import.meta.env.VITE_PUBLIC_PATH;
export const ROUTE_PATH = {
    DASHBOARD: PUBLIC_PATH + "",
    LOGIN: PUBLIC_PATH + "login",
}

export const routes: RouteRecordRaw[] = [
    {
        path: ROUTE_PATH.DASHBOARD,
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: {
            title: "首页",
        },
    },
    {
        path: ROUTE_PATH.LOGIN,
        name: "Login",
        component: () => import("@/views/user/login.vue"),
        meta: {
            title: "登录",
        },
    },
];
