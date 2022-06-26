import { tryOnUnmounted, useDark, useToggle } from "@vueuse/core";
import { emitter } from "@/utils/event";

const isDark = useDark();
const toggleDark = useToggle(isDark);

export function useDarkMode(onChanged?: (dark: boolean) => void) {
    if (onChanged) {
        emitter.on("theme-dark", onChanged);
        tryOnUnmounted(() => {
            emitter.off("theme-dark", onChanged);
            console.log("[useDarkMode] - tryOnUnmounted remove theme-dark listener");
        });
    }
    return {
        isDark,
        toggleDark,
    };
}
