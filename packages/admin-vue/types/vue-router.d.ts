import "vue-router";
import type { IRouteMeta } from "admin-common/src/permission";
declare module "vue-router" {
    interface RouteMeta extends IRouteMeta {}
}
