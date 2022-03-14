import { routes } from "./routes";
import type { App } from "vue";
import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";
import { setupGuard } from "./guard";

export const router = createRouter({
    history: createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH),
    routes: routes,
    strict: true,
    scrollBehavior: () => ({ left: 0, top: 0 }),
});

setupGuard(router);

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
