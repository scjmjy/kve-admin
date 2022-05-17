import type { App, ObjectDirective } from "vue";
import { ClickOutside } from "element-plus";
import { useUserStore } from "@/store/modules/user";

const hasPerm: ObjectDirective<HTMLElement, string | string[]> = {
    mounted(el, binding) {
        const userStore = useUserStore();
        const { value, modifiers } = binding;
        if (!userStore.hasPerm(value, modifiers["some"])) {
            el.parentNode && el.parentNode.removeChild(el);
        }
    },
};

export function setupDirectives(app: App) {
    app.directive("click-outside", ClickOutside);
    app.directive("has-perm", hasPerm);
}
