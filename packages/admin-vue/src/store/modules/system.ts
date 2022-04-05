import { ElementPlusBreackpoints, useBreakpoints } from "@/composables/useBreakpoints";
import { defineStore } from "pinia";
import { store } from "@/store";
import { normalizedRoutes } from "@/router/routes";
import { watch } from "vue";

export type MenuMode = "NORMAL" | "OFFSCREEN";
export interface MenuState {
    mode: MenuMode;
    collapse: boolean;
}

export type ScreenMode = keyof typeof ElementPlusBreackpoints | "xs";
export interface ScreenState {
    mode: ScreenMode;
    footer: boolean;
    tags: boolean;
}

const breakpoints = useBreakpoints();

const storeDefinition = defineStore({
    id: "system",
    state: () => {
        const modes = toggleScreenAndMenuMode([
            breakpoints.sm.value,
            breakpoints.md.value,
            breakpoints.lg.value,
            breakpoints.xl.value,
        ]);

        watch(
            () => [breakpoints.sm.value, breakpoints.md.value, breakpoints.lg.value, breakpoints.xl.value],
            (bps) => {
                const modes = toggleScreenAndMenuMode(bps);
                const systemStore = useSystemStore();
                systemStore.screen.mode = modes.screenMode;
                systemStore.menu.mode = modes.menuMode;
                systemStore.menu.collapse = modes.menuCollpase;
            },
        );

        return {
            theme: "default",
            screen: {
                mode: modes.screenMode,
                footer: true,
                tags: true,
            } as ScreenState,
            menu: {
                mode: modes.menuMode,
                collapse: modes.menuCollpase,
            } as MenuState,
            router: {
                allRoutes: normalizedRoutes,
            },
        };
    },
    actions: {},
});

export function useSystemStore() {
    return storeDefinition(store);
}

function toggleScreenAndMenuMode(bps: boolean[]) {
    // console.log("[toggleScreenAndMenuMode]", bps);

    let screenMode: ScreenMode;
    let menuMode: MenuMode;
    let menuCollpase = false;
    const lastTrueIndex = bps.lastIndexOf(true);
    switch (lastTrueIndex) {
        case 3:
            screenMode = "xl";
            break;
        case 2:
            screenMode = "lg";
            break;
        case 1:
            screenMode = "md";
            break;
        case 0:
            screenMode = "sm";
            break;
        default:
            screenMode = "xs";
            break;
    }

    if (screenMode === "xs") {
        menuMode = "OFFSCREEN";
        menuCollpase = true;
    } else {
        menuMode = "NORMAL";
        if (screenMode === "sm") {
            menuCollpase = true;
        } else {
            menuCollpase = false;
        }
    }
    return {
        screenMode,
        menuMode,
        menuCollpase,
    };
}
