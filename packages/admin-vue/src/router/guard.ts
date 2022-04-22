import { ROUTE_PATH } from "./consts";
import { RouteLocationRaw, Router } from "vue-router";
import { useUserStore } from "@/store/modules/user";

const WHITE_LIST = [ROUTE_PATH.LOGIN];

export function setupGuard(router: Router) {
    const userStore = useUserStore();

    router.beforeEach(async (to, from, next) => {
        // console.log("[setupGuard]", to, from);
        const loginLocation: RouteLocationRaw = {
            path: ROUTE_PATH.LOGIN,
            replace: true,
            query: {
                redirect: to.fullPath,
            },
        };
        let location: Undefinable<RouteLocationRaw> = undefined;
        const { token, _id } = userStore.userProfile;
        if (token) {
            if (to.path === ROUTE_PATH.LOGIN) {
                location = {
                    path: ROUTE_PATH.DASHBOARD,
                };
            } else if (!_id) {
                try {
                    await userStore.getUserProfile();
                } catch (error) {
                    userStore.cleanup();
                    location = loginLocation;
                }
            }
        } else {
            const isWhite = WHITE_LIST.includes(to.path);
            if (!isWhite) {
                location = loginLocation;
            }
        }
        if (location) {
            next(location);
        } else {
            next();
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
