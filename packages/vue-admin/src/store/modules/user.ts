import { ROUTE_PATH } from "./../../router/routes";
import { defineStore } from "pinia";
import { LoginCredential } from "@common/login";
import { UserInfo } from "@/api/model/user";
import { login } from "@/api/user";
import { store } from "@/store";
import { loadStorableObject } from "@/utils/storage";
import { setTokenHeader } from "@/api/request";

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
        userInfo: loadStorableObject(UserInfo.STORAGE_KEY, UserInfo),
    }),
    getters: {},
    actions: {
        async login(credential: LoginCredential) {
            const res = await login(credential);
            console.log("[login]", res);
            const { token } = res.data;
            setTokenHeader(token);
            this.userInfo.token = token;
            this.userInfo.userName = credential.userName;
            this.userInfo.save();
            return res;
        },

        async logout() {
            setTokenHeader("");
            this.userInfo.remove();
            window.location.href = ROUTE_PATH.DASHBOARD;
        },
    },
});

export function useUserStore() {
    return storeDefinition(store);
}
