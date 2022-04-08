import { Router } from "vue-router";
import { useUserStore } from "@/store/modules/user";

const WHITE_LIST = ["/login"];

export function setupGuard(router: Router) {
    const userStore = useUserStore();

    router.beforeEach((to, from, next) => {
        // console.log("[setupGuard]", to, from);
        if (userStore.userProfile.token) {
            next();
        } else {
            const isWhite = WHITE_LIST.includes(to.path);
            if (isWhite) {
                next();
            } else {
                next({
                    path: "/login",
                    replace: true,
                    query: {
                        redirect: to.fullPath,
                    },
                });
            }
        }
    });

    // router.afterEach((to, from) => {
    //     if (to.path === ROUTE_PATH.REDIRECT) {
    //         const realPath = (to.query.path || ROUTE_PATH.DASHBOARD) as string;
    //         delete to.query.path;
    //         router.replace({
    //             path: realPath,
    //             query: to.query,
    //         });
    //     }
    // });
}
