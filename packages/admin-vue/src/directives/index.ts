import { App, DirectiveBinding, ObjectDirective, VueElement } from "vue";
import { ClickOutside } from "element-plus";
import { PermMatchMode } from "admin-common";
import { useUserStore } from "@/store/modules/user";
import { contextMenu } from "./context-menu";

function hasPerm(): ObjectDirective<HTMLElement | VueElement, string | string[]> {
    function test(el: HTMLElement | VueElement, binding: DirectiveBinding<string | string[]>) {
        const userStore = useUserStore();
        const { value, arg = "every" } = binding;
        if (!userStore.hasPerm(value, arg as PermMatchMode)) {
            el.parentNode && el.parentNode.removeChild(el);
        } else {
            // @ts-ignore
            el.$__parentNode && el.$__parentNode.appendChild(el);
        }
    }

    return {
        mounted(el, binding) {
            // @ts-ignore
            el.$__parentNode = el.parentNode;
            test(el, binding);
        },
        updated(el, binding) {
            test(el, binding);
        },
    };
}

export function setupDirectives(app: App) {
    app.directive("click-outside", ClickOutside);
    app.directive("has-perm", hasPerm());
    app.directive("context-menu", contextMenu);
}
