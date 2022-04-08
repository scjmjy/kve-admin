import type { App } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { flatRoutes } from "./routes";
import { setupGuard } from "./guard";

export const router = createRouter({
    history: createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH),
    routes: flatRoutes,
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

// // reset router
// export function resetRouter() {
//     router.getRoutes().forEach((route) => {
//         const { name } = route;
//         if (name && !WHITE_NAME_LIST.includes(name as string)) {
//             router.hasRoute(name) && router.removeRoute(name);
//         }
//     });
// }

// export function setupRouter(app: App<Element>) {
//     app.use(router);
// }
