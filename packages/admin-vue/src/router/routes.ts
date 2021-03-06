

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
