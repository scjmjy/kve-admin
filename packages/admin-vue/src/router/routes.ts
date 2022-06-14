import { RouteRecordRaw } from "vue-router";
import { IPermission } from "admin-common";
import { useLayout } from "@/layout";
import DefaultLayout from "@/layout/DefaultLayout.vue";
import { usePageModules } from "@/composables/usePageModules";
import { FakeLayout, flattenRoutes, makeFullpathRoutes, RouteRecordMenuItem } from "./utils";
import { ROUTE_PATH } from "./consts";
import { router } from "./index";

/**
 * 注意事项：
 *  1. route.name 的重要性
 *      - 对于 route.meta.cacheable=true (即需要 keep-alive )的页面，务必保证 route.name 和 \<script setup name="XXX"\>中的 name 一致，且全局唯一
 *      - 外部链接的 route.name 不能为空，且全局唯一
 *  2. route.path 不要以 ROUTE_PATH.REDIRECT 为开头，因为不会出现在 TabList 中
 *  3. route.redirect
 *     - 如果为空，flattenRoutes 会默认指定重定向至 children[0]
 *     - 以 '/' 开头的，会被认为绝对路径
 *     - 不以 '/' 开头的，会被认为是 children 中的某个 path，那么flattenRoutes 会自动计算。
 */
const staticRawRoutes: RouteRecordRaw[] = [
    {
        path: ROUTE_PATH.REDIRECT,
        component: DefaultLayout,
        meta: {
            visible: false,
        },
        children: [
            {
                path: ":path(.*)",
                component: () => import("@/views/internal/redirect.vue"),
            },
        ],
    },
    {
        path: ROUTE_PATH.LOGIN,
        name: "Login",
        component: () => import("@/views/system/user/login.vue"),
        meta: {
            visible: false,
        },
    },
];

export const fullpathRoutes = makeFullpathRoutes(staticRawRoutes);

export function findRouteFullpath(name: string, routes = fullpathRoutes): string {
    for (const route of routes) {
        if (route.name === name) {
            return route.path;
        } else if (route.children && route.children.length) {
            const found = findRouteFullpath(name, route.children);
            if (found) {
                return found;
            }
        }
    }
    return "";
}

export const staticFlatRoutes = flattenRoutes(staticRawRoutes);

export function addServerRoutes(perms: IPermission[]) {
    const rawRoutes: RouteRecordRaw[] = [];
    makeRawRoutes(rawRoutes, perms);
    // console.log("[makeRawRoutes]", rawRoutes);

    const serverFlatRoutes = flattenRoutes(rawRoutes);
    // console.log("[serverFlatRoutes]", serverFlatRoutes);
    serverFlatRoutes.forEach((item) => {
        router.addRoute(item);
    });
    router.addRoute({
        path: ROUTE_PATH.ERROR_404,
        component: () => import("@/views/internal/error/404.vue"),
        meta: {
            visible: false,
        },
    });

    fullpathRoutes.push(...makeFullpathRoutes(rawRoutes));
}

function makeRawRoutes(routes: RouteRecordRaw[], perms: IPermission[]) {
    const { pageModuleOpts } = usePageModules();
    const { layoutOpts } = useLayout();

    for (const perm of perms) {
        if (perm.type === "menugroup") {
            const foundLayout = layoutOpts.find((item) => item.value === perm.layout);
            const route: RouteRecordRaw = {
                name: perm.name || "",
                path: perm.path || "",
                component: foundLayout ? foundLayout.component : FakeLayout,
                meta: {
                    title: perm.title,
                    icon: perm.icon,
                    visible: perm.visible,
                },
                children: [],
            };
            makeRawRoutes(route.children!, perm.children || []);
            routes.push(route);
        } else if (perm.type === "menuitem") {
            const com = pageModuleOpts.find((page) => page.value === perm.component);
            if (com && com.component) {
                const route: RouteRecordRaw = {
                    name: perm.name || "",
                    path: perm.path || "",
                    component: com.component,
                    meta: {
                        title: perm.title,
                        icon: perm.icon,
                        visible: perm.visible,
                        footer: perm.footer,
                        pinned: perm.pinned,
                        cacheable: perm.cacheable,
                        forName: perm.forName,
                        pathKey: perm.pathKey,
                        iframe: perm.iframe,
                    },
                };
                routes.push(route);
            }
        }
    }
}

// 开发前期使用的纯本地路由，保留一下代码以供参考
// export const staticRawRoutes: RouteRecordRaw[] = [
//     {
//         path: ROUTE_PATH.REDIRECT,
//         component: DefaultLayout,
//         meta: {
//             visible: false,
//         },
//         children: [
//             {
//                 path: ":path(.*)",
//                 component: () => import("@/views/internal/redirect.vue"),
//             },
//         ],
//     },
//     {
//         path: ROUTE_PATH.LOGIN,
//         name: "Login",
//         component: () => import("@/views/system/user/login.vue"),
//         meta: {
//             visible: false,
//         },
//     },
//     {
//         name: "Dashboard",
//         path: ROUTE_PATH.DASHBOARD,
//         meta: { title: "仪表盘Demo" },
//         component: DefaultLayout,
//         children: [
//             {
//                 name: "DashboardIndex1",
//                 path: "",
//                 meta: { title: "首页1", icon: "DataLine", pinned: true },
//                 component: () => import("@/views/dashboard/page-DashboardIndex.vue"),
//             },
//             {
//                 name: "DashboardIndex2",
//                 path: "index2",
//                 meta: { title: "首页2", icon: "DataAnalysis", pinned: true },
//                 component: () => import("@/views/dashboard/page-DashboardIndex2.vue"),
//             },
//         ],
//     },
//     {
//         name: "System",
//         path: "/system",
//         meta: { title: "系统管理" },
//         component: DefaultLayout,
//         redirect: "usermanage",
//         children: [
//             {
//                 name: "UserManage",
//                 path: "usermanage",
//                 meta: { title: "用户角色", icon: "icon-department" },
//                 component: () => import("@/views/system/manage/page-UserManage.vue"),
//             },
//             {
//                 name: "MenuManage",
//                 path: "menumanage",
//                 meta: { title: "权限菜单", icon: "Menu" },
//                 component: () => import("@/views/system/manage/page-MenuManage.vue"),
//             },
//         ],
//     },
//     {
//         name: "Page",
//         path: "/pages",
//         meta: { title: "页面Demo" },
//         component: DefaultLayout,
//         redirect: "page1",
//         children: [
//             {
//                 name: "Page1",
//                 path: "page1",
//                 meta: { title: "测试meta.pathKey", icon: "Document" },
//                 component: () => import("@/views/pages/page1.vue"),
//             },
//             {
//                 name: "Page1Detail",
//                 path: "detail1",
//                 meta: {
//                     title: "页面1的详情",
//                     visible: false,
//                     forName: "Page1",
//                     pathKey: "fullPath",
//                 },
//                 component: () => import("@/views/pages/detail1.vue"),
//             },
//             {
//                 name: "Page2",
//                 path: "page2",
//                 meta: { title: "测试meta.cacheable", icon: "Document", cacheable: false },
//                 component: () => import("@/views/pages/page2.vue"),
//             },
//             {
//                 name: "PageGroup1",
//                 path: "pagegroup1",
//                 meta: { title: "页面组1", icon: "Files" },
//                 component: DefaultLayout,
//                 redirect: "page2", // 重定向至 page2
//                 children: [
//                     {
//                         name: "NestedPage1",
//                         path: "page1",
//                         meta: { title: "嵌套页面1", icon: "Document" },
//                         component: () => import("@/views/pages/nested/page1.vue"),
//                     },
//                     {
//                         name: "NestedPage2",
//                         path: "page2",
//                         meta: { title: "嵌套页面2", icon: "Document" },
//                         component: () => import("@/views/pages/nested/page2.vue"),
//                     },
//                     {
//                         name: "NestedPageGroup1",
//                         path: "pagegroup1",
//                         meta: { title: "嵌套页面组1", icon: "Files" },
//                         component: DefaultLayout,
//                         redirect: "page1",
//                         children: [
//                             {
//                                 name: "ThirdNestedPage1",
//                                 path: "page1",
//                                 meta: { title: "测试 route.params", icon: "Document" },
//                                 component: () => import("@/views/pages/nested/third-nested/page1.vue"),
//                             },
//                             {
//                                 name: "ThirdNestedPage1Detail",
//                                 path: ":id",
//                                 meta: { title: "第三层嵌套页面1的详情", visible: false, forName: "ThirdNestedPage1" },
//                                 component: () => import("@/views/pages/nested/third-nested/detail1.vue"),
//                             },
//                             {
//                                 name: "ThirdNestedPage2",
//                                 path: "page2",
//                                 meta: { title: "第三层嵌套页面2", icon: "Document" },
//                                 component: () => import("@/views/pages/nested/third-nested/page2.vue"),
//                             },
//                             {
//                                 name: "FourthPageGroup1",
//                                 path: "pagegroup1",
//                                 meta: { title: "嵌套的嵌套页面组1", icon: "Files" },
//                                 component: DefaultLayout,
//                                 redirect: "page1",
//                                 children: [
//                                     {
//                                         name: "FourthNestedPage1",
//                                         path: "page1",
//                                         meta: { title: "第四层嵌套页面1", icon: "Document" },
//                                         component: () =>
//                                             import("@/views/pages/nested/third-nested/fourth-nested/page1.vue"),
//                                     },
//                                     {
//                                         name: "FourthNestedPage2",
//                                         path: "page2",
//                                         meta: { title: "第四层嵌套页面2", icon: "Document" },
//                                         component: () =>
//                                             import("@/views/pages/nested/third-nested/fourth-nested/page2.vue"),
//                                     },
//                                 ],
//                             },
//                         ],
//                     },
//                 ],
//             },
//         ],
//     },
//     {
//         path: "/external",
//         component: DefaultLayout,
//         meta: {
//             title: "外部链接",
//         },
//         children: [
//             {
//                 path: "https://www.baidu.com",
//                 component: FakeLayout,
//                 meta: {
//                     title: "百度",
//                     icon: "icon-baidu",
//                 },
//             },
//             {
//                 path: "https://www.bing.com",
//                 component: FakeLayout,
//                 meta: {
//                     title: "Bing",
//                     icon: "icon-edge",
//                 },
//             },
//             {
//                 path: "bing",
//                 name: "Bing",
//                 component: BlankPage,
//                 meta: {
//                     title: "Bing(内嵌)",
//                     icon: "icon-edge",
//                     iframe: "https://www.bing.com",
//                 },
//             },
//             {
//                 path: "vue3",
//                 name: "Vue3",
//                 component: BlankPage,
//                 meta: {
//                     title: "Vue3(内嵌)",
//                     icon: "icon-vue",
//                     iframe: "https://v3.cn.vuejs.org",
//                 },
//             },
//             {
//                 path: "KVE",
//                 name: "KVE",
//                 component: BlankPage,
//                 meta: {
//                     title: "KVE(内嵌)",
//                     icon: "",
//                     iframe: "https://localhost:14400",
//                 },
//             },
//         ],
//     },
//     {
//         path: "/user",
//         component: DefaultLayout,
//         meta: {
//             title: "用户相关路由",
//             visible: false,
//         },
//         children: [
//             {
//                 path: "profile",
//                 component: () => import("@/views/system/user/profile.vue"),
//                 meta: {
//                     title: "个人资料",
//                 },
//             },
//         ],
//     },
//     {
//         path: "/:path*",
//         component: () => import("@/views/internal/error/404.vue"),
//         meta: {
//             visible: false,
//         },
//     },
// ];
