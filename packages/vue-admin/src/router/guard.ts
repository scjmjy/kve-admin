import { Router } from "vue-router";
import { useUserStore } from "@/store/modules/user";

const WHITE_LIST = ["/login"];

export function setupGuard(router: Router) {
    const userStore = useUserStore();

    router.beforeEach((to, from, next) => {
        if (userStore.userInfo.token) {
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
}
