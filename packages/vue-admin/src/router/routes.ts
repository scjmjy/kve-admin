import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";

export const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: {
            title: "首页",
        },
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("@/views/user/login.vue"),
        meta: {
            title: "登录",
        },
    },
];
