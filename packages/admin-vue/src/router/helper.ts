import type { Router, RouteRecordRaw } from "vue-router";

export class RouterPathFinder {
    public routes: RouteRecordRaw[];
    constructor(router: Router) {
        this.routes = router.getRoutes();
    }
    getFullPath(routeName: string) {
        const found = this.routes.find((route) => route.name === routeName);
        return found ? found.path : undefined;
    }
}
