import type { App } from "vue";
import { ClickOutside } from "element-plus";

export function setupDirectives(app: App) {
    app.directive("click-outside", ClickOutside);
}
