import { App, createApp, DefineComponent, ObjectDirective, VueElement } from "vue";
import * as components from "@element-plus/icons-vue";
import ContextMenu from "@/components/contextmenu/ContextMenu.vue";
import { ContextMenuItem } from "@/components/contextmenu/types";
let contextMenuApp: App<HTMLUListElement> | undefined = undefined;

export function createContextMenuApp(items: ContextMenuItem[]) {
    destroyContextMenuApp();

    const contextMenuMountEl = document.createElement("ul");
    contextMenuMountEl.className = "contextMenu";
    document.body.appendChild(contextMenuMountEl);

    contextMenuApp = createApp(ContextMenu, {
        items,
    }) as App<HTMLUListElement>;
    setupContextMenuApp(contextMenuApp);
    contextMenuApp.mount(contextMenuMountEl);

    window.addEventListener("click", onWindowClickListener);
    window.addEventListener("resize", destroyContextMenuApp);
}

function setupContextMenuApp(app: App) {
    // TODO 优化：按需加载图标
    const icons = components as unknown as Record<string, DefineComponent<{}, {}, any>>;
    for (const key in icons) {
        const cfg = icons[key];
        app.component(cfg.name, cfg);
    }
}

function onWindowClickListener(event: MouseEvent) {
    // console.log("[onWindowClickListener] target: ", event.target);
    if (!contextMenuApp || event.target === contextMenuApp!._container) {
        // 如果点击了菜单的边缘位置，那就不用销毁菜单了
        return;
    }
    destroyContextMenuApp();
}

export function destroyContextMenuApp() {
    if (contextMenuApp) {
        const contextMenuMountEl = contextMenuApp._container!;
        contextMenuApp.unmount();
        contextMenuMountEl.remove();
        contextMenuApp = undefined;

        window.removeEventListener("click", onWindowClickListener);
        window.removeEventListener("resize", destroyContextMenuApp);
    }
}

export const contextMenu: ObjectDirective<HTMLElement | VueElement, ContextMenuItem[]> = {
    mounted(el, binding) {
        const { value } = binding;
        function onContextMenu(event: MouseEvent) {
            event.preventDefault();
            createContextMenuApp(value);

            const contextMenuMountEl = contextMenuApp!._container!;

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
