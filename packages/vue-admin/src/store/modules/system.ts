import { defineStore } from "pinia";
import { store } from "@/store";

// interface AppState {
//     darkMode?: ThemeEnum;
//     // Page loading status
//     pageLoading: boolean;
//     // project config
//     projectConfig: ProjectConfig | null;
//     // When the window shrinks, remember some states, and restore these states when the window is restored
//     beforeMiniInfo: BeforeMiniState;
// }

const storeDefinition = defineStore({
    id: "system",
    state: () => ({
        theme: "default",
    }),
    getters: {},
    actions: {},
});

export function useSystemStore() {
    return storeDefinition(store);
}
