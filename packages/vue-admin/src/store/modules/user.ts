import { UserInfo } from "./../../api/model/user";
import { defineStore } from "pinia";
import { store } from "@/store";
import { loadStorableObject } from "@/utils/storage";
import { login } from "@/api/user";

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
    id: "user",
    state: () => ({
        token: "",
        userInfo: loadStorableObject(UserInfo.STORAGE_KEY, UserInfo),
    }),
    getters: {},
    actions: {
        async login(userName: string, password: string) {
            const res = await login(userName, password);
            this.token = res.token;
        },
    },
});

export function useUserStore() {
    return storeDefinition(store);
}
