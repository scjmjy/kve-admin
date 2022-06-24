import { App, createApp, DefineComponent, ObjectDirective, VueElement } from "vue";
import * as components from "@element-plus/icons-vue";
import ContextMenu from "@/components/contextmenu/ContextMenu.vue";
import { ContextMenuItem } from "@/components/contextmenu/types";

function setupContextMenuApp(app: App) {
    // TODO 优化：按需加载图标
    const icons = components as unknown as Record<string, DefineComponent<{}, {}, any>>;
    for (const key in icons) {
        const cfg = icons[key];
        app.component(cfg.name, cfg);
    }
}

let contextMenuApp: App | undefined = undefined;

export function createContextMenuApp(items: ContextMenuItem[]) {
    destroyContextMenuApp();

    const contextMenuMountEl = document.createElement("ul");
    contextMenuMountEl.className = "contextMenu";
    document.body.appendChild(contextMenuMountEl);

    contextMenuApp = createApp(ContextMenu, {
        items,
    });
    setupContextMenuApp(contextMenuApp);
    contextMenuApp.mount(contextMenuMountEl);

    window.addEventListener("click", destroyContextMenuApp);
    window.addEventListener("resize", destroyContextMenuApp);
}

export function destroyContextMenuApp() {
    if (contextMenuApp) {
        const contextMenuMountEl = contextMenuApp._container as HTMLUListElement;
        contextMenuApp.unmount();
        contextMenuMountEl.remove();
        contextMenuApp = undefined;

        window.removeEventListener("click", destroyContextMenuApp);
        window.removeEventListener("resize", destroyContextMenuApp);
    }
}

export const contextMenu: ObjectDirective<HTMLElement | VueElement, ContextMenuItem[]> = {
    mounted(el, binding) {
        const { value } = binding;
        function onContextMenu(event: MouseEvent) {
            event.preventDefault();
            createContextMenuApp(value);

            const contextMenuMountEl = contextMenuApp!._container as HTMLUListElement;

            const { clientX, clientY } = event;

            const positionY =
                clientY + contextMenuMountEl.scrollHeight >= window.innerHeight
                    ? window.innerHeight - contextMenuMountEl.scrollHeight - 20
                    : clientY;
            const positionX =
                clientX + contextMenuMountEl.scrollWidth >= window.innerWidth
                    ? window.innerWidth - contextMenuMountEl.scrollWidth - 20
                    : clientX;

            contextMenuMountEl.setAttribute("style", `--top: ${positionY}px;--left: ${positionX}px;`);
        }
        el.addEventListener("contextmenu", onContextMenu);
        // el.addEventListener("click");
        // @ts-ignore
        el.$__onContextMenu = onContextMenu;
    },
    updated() {
        destroyContextMenuApp();
    },
    beforeUnmount(el) {
        // @ts-ignore
        el.removeEventListener("contextmenu", el.$__onContextMenu);

        destroyContextMenuApp();
    },
};
