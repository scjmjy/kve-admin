import { isExternalLink } from "@/utils/is";
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

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

function makeFullpath(parentPath: string, childPath: string) {
    if (isExternalLink(childPath) || childPath.startsWith("/")) {
        return childPath;
    } else if (parentPath.endsWith("/")) {
        return `${parentPath}${childPath}`;
    } else {
        return `${parentPath}/${childPath}`;
    }
}

function makeFullpathRoute(route: RouteRecordRaw | RouteRecordMenuItem, parentPath = ""): RouteRecordMenuItem {
    const fullPath = makeFullpath(parentPath, route.path);
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
    const fullPath = makeFullpath(parentPath, route.path);
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
