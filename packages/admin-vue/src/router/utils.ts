import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

export interface RouteRecordMenuItem extends Pick<RouteRecordRaw, "name" | "path" | "meta"> {
    children?: RouteRecordMenuItem[];
}

export function normalizeRoutes(routes: (RouteRecordRaw | RouteRecordMenuItem)[], parentPath = "") {
    const normalizedRoutes: RouteRecordMenuItem[] = [];
    routes.forEach((route) => {
        if (!route.meta?.hidden) {
            normalizedRoutes.push(normalizeRoute(route, parentPath));
        }
    });
    return normalizedRoutes;
}

function normalizePath(parentPath: string, childPath: string) {
    if (parentPath.endsWith("/") || childPath.startsWith("/")) {
        return `${parentPath}${childPath}`;
    } else {
        return `${parentPath}/${childPath}`;
    }
}

function normalizeRoute(route: RouteRecordRaw | RouteRecordMenuItem, parentPath = ""): RouteRecordMenuItem {
    const fullPath = normalizePath(parentPath, route.path);
    if (route.children && route.children.length) {
        return {
            name: route.name,
            meta: { ...route.meta! },
            path: fullPath,
            children: normalizeRoutes(route.children, fullPath),
        };
    } else {
        return {
            name: route.name,
            meta: { ...route.meta! },
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
        flatRoutes.push({
            ...route,
            path: fullPath,
            children: children,
        });
    } else {
        flatRoutes.push(route);
    }
}
