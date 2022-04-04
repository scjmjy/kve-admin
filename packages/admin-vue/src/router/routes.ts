import { RouteRecordRaw } from "vue-router";
import DefaultLayout from "@/layout/DefaultLayout.vue";
import { flattenRoutes, normalizeRoutes } from "./utils";

const PUBLIC_PATH = import.meta.env.VITE_PUBLIC_PATH;
export const ROUTE_PATH = {
    DASHBOARD: PUBLIC_PATH,
    LOGIN: PUBLIC_PATH + "login",
};

export const routes: RouteRecordRaw[] = [
    {
        path: ROUTE_PATH.LOGIN,
        name: "Login",
        component: () => import("@/views/user/login.vue"),
        meta: {
            title: "登录",
            hidden: true,
        },
    },
    {
        name: "Dashboard",
        path: ROUTE_PATH.DASHBOARD,
        meta: { title: "仪表盘Demo" },
        component: DefaultLayout,
        redirect: ROUTE_PATH.DASHBOARD,
        children: [
            {
                name: "Index1",
                path: "",
                meta: { title: "首页1" },
                component: () => import("@/views/dashboard/index.vue"),
            },
            {
                name: "Index2",
                path: "index2",
                meta: { title: "首页2" },
                component: () => import("@/views/dashboard/index2.vue"),
            },
        ],
    },
    {
        name: "Page",
        path: "/pages",
        meta: { title: "页面Demo" },
        component: DefaultLayout,
        redirect: "/pages/page1",
        children: [
            {
                name: "Page1",
                path: "page1",
                meta: { title: "页面1" },
                component: () => import("@/views/pages/page1.vue"),
            },
            {
                name: "Page2",
                path: "page2",
                meta: { title: "页面2" },
                component: () => import("@/views/pages/page2.vue"),
            },
            {
                name: "PageGroup1",
                path: "pagegroup1",
                meta: { title: "页面组1" },
                component: DefaultLayout,
                redirect: "/pages/pagegroup1/page1",
                children: [
                    {
                        name: "NestedPage1",
                        path: "page1",
                        meta: { title: "嵌套页面1" },
                        component: () => import("@/views/pages/nested/page1.vue"),
                    },
                    {
                        name: "NestedPage2",
                        path: "page2",
                        meta: { title: "嵌套页面2" },
                        component: () => import("@/views/pages/nested/page2.vue"),
                    },
                    {
                        name: "NestedPageGroup1",
                        path: "pagegroup1",
                        meta: { title: "嵌套页面组1" },
                        component: DefaultLayout,
                        redirect: "/pages/pagegroup1/pagegroup1/page1",
                        children: [
                            {
                                name: "ThirdNestedPage1",
                                path: "page1",
                                meta: { title: "第三层嵌套页面1" },
                                component: () => import("@/views/pages/nested/third-nested/page1.vue"),
                            },
                            {
                                name: "ThirdNestedPage2",
                                path: "page2",
                                meta: { title: "第三层嵌套页面2" },
                                component: () => import("@/views/pages/nested/third-nested/page2.vue"),
                            },
                            {
                                name: "FourthPageGroup1",
                                path: "pagegroup1",
                                meta: { title: "嵌套的嵌套页面组1" },
                                component: DefaultLayout,
                                redirect: "/pages/pagegroup1/pagegroup1/pagegroup1/page1",
                                children: [
                                    {
                                        name: "FourthNestedPage1",
                                        path: "page1",
                                        meta: { title: "第四层嵌套页面1" },
                                        component: () =>
                                            import("@/views/pages/nested/third-nested/fourth-nested/page1.vue"),
                                    },
                                    {
                                        name: "FourthNestedPage2",
                                        path: "page2",
                                        meta: { title: "第四层嵌套页面2" },
                                        component: () =>
                                            import("@/views/pages/nested/third-nested/fourth-nested/page2.vue"),
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

export const normalizedRoutes = normalizeRoutes(routes);

export const flatRoutes = flattenRoutes(routes);
