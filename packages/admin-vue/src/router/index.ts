import type { App } from "vue";
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { IPermission } from "admin-common";
import { useLayout } from "@/layout";
import DefaultLayout from "@/layout/DefaultLayout.vue";
import RedirectVue from "@/views/internal/redirect.vue";
import LoginVue from "@/views/system/user/login.vue";
import { usePageModules } from "@/composables/usePageModules";
import { flattenRoutes, makeFullpathRoutes } from "./utils";
import { ROUTE_PATH } from "./consts";
import { setupGuard } from "./guard";

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
                component: RedirectVue,
            },
        ],
    },
    {
        path: ROUTE_PATH.LOGIN,
        name: "Login",
        component: LoginVue,
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

export const router = createRouter({
    history: createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH),
    routes: staticFlatRoutes,
    strict: false,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        } else {
            return { left: 0, top: 0 };
        }
    },
});

export function setupRouter(app: App) {
    setupGuard(router);
    app.use(router);
}

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
            if (!foundLayout) {
                continue;
            }
            const route: RouteRecordRaw = {
                name: perm.name || "",
                path: perm.path || "",
                component: foundLayout.component,
                meta: {
                    title: perm.title,
                    icon: perm.icon,
                    visible: perm.visible,
                },
                children: [],
            };
            makeRawRoutes(route.children!, perm.children || []);
            if (route.children?.length) {
                routes.push(route);
            }
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
