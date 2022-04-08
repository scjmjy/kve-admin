import { Ref, ref } from "vue";
import { ResizeObserverEntry, tryOnUnmounted, useResizeObserver } from "@vueuse/core";

export type ResizeListener = (entries: readonly ResizeObserverEntry[]) => void;

let resizeObserver: any | undefined;
const listenerSet = new Set<Fn>();

export function initAppMainResize(main: Ref<HTMLDivElement | undefined>) {
    if (!resizeObserver) {
        const handler = (entries: readonly ResizeObserverEntry[]) => {
            listenerSet.forEach((listener) => listener(entries));
        };
        resizeObserver = useResizeObserver(main, (entries) => {
            handler(entries);
        });
    }
}

export function useAppMainResize(listener: ResizeListener) {
    listenerSet.add(listener);
    tryOnUnmounted(() => {
        listenerSet.delete(listener);
    });
}
