import "vue-router";
import type { IRouteMeta } from "admin-common";
declare module "vue-router" {
    interface RouteMeta extends IRouteMeta {}
}
