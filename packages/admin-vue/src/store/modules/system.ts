import { watch } from "vue";
import { RouteLocationNormalizedLoaded, Router } from "vue-router";
import { defineStore } from "pinia";
import { ElementPlusBreackpoints, useBreakpoints } from "@/composables/useBreakpoints";
import { store } from "@/store";
import { fullpathRoutes } from "@/router";
import { RouteRecordMenuItem } from "@/router/utils";
import { ROUTE_PATH } from "@/router/consts";

export type MenuMode = "NORMAL" | "OFFSCREEN";
export interface MenuState {
    mode: MenuMode;
    collapse: boolean;
}

export type ScreenMode = keyof typeof ElementPlusBreackpoints | "xs";

export type ResponsiveScreenMap = Partial<Record<ScreenMode, number>>;

export interface ScreenState {
    mode: ScreenMode;
    footer: boolean;
    tags: boolean;
}

export type RouteRecordVisited = Pick<
    RouteLocationNormalizedLoaded,
    "fullPath" | "path" | "query" | "params" | "meta" | "name"
>;

export interface RouterState {
    fullpathRoutes: RouteRecordMenuItem[];
    cachedTabs: string[];
    visitedRoutes: RouteRecordVisited[];
}

// const ;
// console.log("pageModules", pageModules);

const storeDefinition = defineStore({
    id: "system",
    state: () => {
        const breakpoints = useBreakpoints();
        const modes = toggleScreenAndMenuMode([
            breakpoints.sm.value,
            breakpoints.md.value,
            breakpoints.lg.value,
            breakpoints.xl.value,
        ]);

        watch(
            () => [breakpoints.sm.value, breakpoints.md.value, breakpoints.lg.value, breakpoints.xl.value],
            (bps) => {
                const modes = toggleScreenAndMenuMode(bps);
                const systemStore = useSystemStore();
                systemStore.screen.mode = modes.screenMode;
                systemStore.menu.mode = modes.menuMode;
                systemStore.menu.collapse = modes.menuCollpase;
            },
        );

        return {
            settings: {
                // theme: "default",
                /** 是否支持外链 */
                iframe: true,
            },
            screen: {
                mode: modes.screenMode,
                footer: true,
                tags: true,
            } as ScreenState,
            menu: {
                mode: modes.menuMode,
                collapse: modes.menuCollpase,
            } as MenuState,
            router: {
                fullpathRoutes: fullpathRoutes,
                cachedTabs: [],
                visitedRoutes: [],
            } as RouterState,
        };
    },
    getters: {
        iframes: (state) => state.router.visitedRoutes.filter((route) => !!route.meta.iframe),
    },
    actions: {
        onRouteChanged(route: RouteLocationNormalizedLoaded) {
            if (!route.matched || !route.matched.length || route.matched[0].path === ROUTE_PATH.ERROR_404) {
                // 404 页面
                return;
            }
            const { name, fullPath, path, meta } = route;
            // if (meta.title) {
            //     document.title = meta.title;
            // }
            if (
                !path.startsWith(ROUTE_PATH.REDIRECT) &&
                meta.cacheable !== false &&
                !meta.iframe &&
                name &&
                typeof name === "string" &&
                !this.router.cachedTabs.some((tab) => tab === name)
            ) {
                this.router.cachedTabs.push(name);
            }
            if (
                !path.startsWith(ROUTE_PATH.REDIRECT) &&
                !this.router.visitedRoutes.some((visitedRoute) => {
                    if (route.meta.pathKey === "fullPath") {
                        return visitedRoute.fullPath === fullPath;
                    }
                    return visitedRoute.path === path;
                })
            ) {
                const { fullPath, path, query, meta, name, params } = route;
                const visited = {
                    name,
                    path,
                    fullPath,
                    query,
                    params,
                    meta,
                };
                if (meta.pinned) {
                    this.router.visitedRoutes.unshift(visited);
                } else {
                    this.router.visitedRoutes.push(visited);
                }
            }
        },
        closeTab(route: RouteRecordVisited, isExactActive: boolean, router: Router) {
            const { name, fullPath, path } = route;
            const { cachedTabs, visitedRoutes } = this.router;
            const foundIndex = visitedRoutes.findIndex((visitedRoute) => {
                if (route.meta.pathKey === "fullPath") {
                    return visitedRoute.fullPath === fullPath;
                }
                return visitedRoute.path === path;
            });
            if (foundIndex !== -1) {
                visitedRoutes.splice(foundIndex, 1);

                if (
                    name &&
                    typeof name === "string" &&
                    // 如果 visitedRoutes 中还有名为 ${name} 的路由，就不从 cachedTabs 中删除
                    !visitedRoutes.find((visitedRoute) => visitedRoute.name === name)
                ) {
                    const foundIndex = cachedTabs.findIndex((tab) => tab === name);
                    if (foundIndex !== -1) {
                        cachedTabs.splice(foundIndex, 1);
                    }
                }
                if (!isExactActive) {
                    // 删除的不是当前激活的路由
                    return;
                }
                // 删除的是当前激活的路由，所以需要激活另外一个路由
                const { length } = visitedRoutes;
                if (length) {
                    router.push(visitedRoutes[length - 1].fullPath);
                } else if (route.path === ROUTE_PATH.DASHBOARD) {
                    router.replace({
                        path: ROUTE_PATH.REDIRECT + "/" + ROUTE_PATH.DASHBOARD,
                    });
                } else {
                    router.push(ROUTE_PATH.DASHBOARD);
                }
            }
        },
        closeOtherTab() {},
        refreshTab(route: RouteRecordVisited, router: Router) {
            router.replace({
                path: ROUTE_PATH.REDIRECT + "/" + route.path,
                query: route.query,
            });
        },
    },
});

export function useSystemStore() {
    return storeDefinition(store);
}

function toggleScreenAndMenuMode(bps: boolean[]) {
    // console.log("[toggleScreenAndMenuMode]", bps);

    let screenMode: ScreenMode;
    let menuMode: MenuMode;
    let menuCollpase = false;
    const lastTrueIndex = bps.lastIndexOf(true);
    switch (lastTrueIndex) {
        case 3:
            screenMode = "xl";
            break;
        case 2:
            screenMode = "lg";
            break;
        case 1:
            screenMode = "md";
            break;
        case 0:
            screenMode = "sm";
            break;
        default:
            screenMode = "xs";
            break;
    }

    if (screenMode === "xs") {
        menuMode = "OFFSCREEN";
        menuCollpase = true;
    } else {
        menuMode = "NORMAL";
        if (screenMode === "sm") {
            menuCollpase = true;
        } else {
            menuCollpase = false;
        }
    }
    return {
        screenMode,
        menuMode,
        menuCollpase,
    };
}
