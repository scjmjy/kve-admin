import { RouteRecordRaw } from "vue-router";
import { normalizePath } from "@/utils/url";

export const FakeLayout = () => Promise.resolve({ name: "FakeLayout" });

export interface RouteRecordMenuItem extends Pick<RouteRecordRaw, "name" | "path" | "meta"> {
    children?: RouteRecordMenuItem[];
}

export function makeFullpathRoutes(routes: (RouteRecordRaw | RouteRecordMenuItem)[], parentPath = "") {
    const normalizedRoutes: RouteRecordMenuItem[] = [];
    routes.forEach((route) => {
        normalizedRoutes.push(makeFullpathRoute(route, parentPath));
    });
    return normalizedRoutes;
}

function makeFullpathRoute(route: RouteRecordRaw | RouteRecordMenuItem, parentPath = ""): RouteRecordMenuItem {
    const fullPath = normalizePath(parentPath, route.path);
    if (route.children && route.children.length) {
        return {
            name: route.name,
            meta: route.meta,
            path: fullPath,
            children: makeFullpathRoutes(route.children, fullPath),
        };
    } else {
        return {
            name: route.name,
            meta: route.meta,
            path: fullPath,
        };
    }
}

export function flattenRoutes(routes: RouteRecordRaw[]) {
    const flatRoutes: RouteRecordRaw[] = [];
    routes.forEach((route) => {
        flattenRoute(flatRoutes, route);
    });
    // console.log("[flattenRoutes]", flatRoutes);
    return flatRoutes;
}

function flattenRoute(flatRoutes: RouteRecordRaw[], route: RouteRecordRaw, parentPath = "") {
    const fullPath = normalizePath(parentPath, route.path);
    if (route.children && route.children.length) {
        const children: RouteRecordRaw[] = [];
        route.children.forEach((child) => {
            if (child.children && child.children.length) {
                flattenRoute(flatRoutes, child, fullPath);
            } else {
                children.push(child);
            }
        });
        let redirect = route.redirect ? normalizePath(fullPath, route.redirect as string) : "";
        if (!redirect && route.children.length) {
            redirect = normalizePath(fullPath, route.children[0].path);
        }
        flatRoutes.push({
            name: route.name,
            component: route.component,
            meta: route.meta,
            path: fullPath,
            redirect,
            children,
        });
    } else {
        flatRoutes.push({
            ...route,
            path: fullPath,
        });
    }
}
