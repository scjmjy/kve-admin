import { destroyContextMenuApp } from "@/directives/context-menu";

export function useContextMenu() {
    return {
        hideContextMenu() {
            destroyContextMenuApp();
        },
    };
}
