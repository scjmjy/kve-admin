import { defineStore } from "pinia";
import { LoginCredential } from "admin-common";
import { ROUTE_PATH } from "@/router/routes";
import { setTokenHeader } from "@/api/request";
import { login } from "@/api/user";
import { UserProfile } from "@/api/model/user";
import { store } from "@/store";
import { loadStorableObject } from "@/utils/storage";

const storeDefinition = defineStore({
    id: "user",
    state: () => {
        const userProfile = loadStorableObject(UserProfile.STORAGE_KEY, UserProfile);
        if (userProfile.token) {
            setTokenHeader(userProfile.token);
        }
        return {
            userProfile,
        };
    },
    getters: {},
    actions: {
        async login(credential: LoginCredential) {
            const res = await login(credential);
            // console.log("[login]", res);
            const { token, id } = res.data;
            setTokenHeader(token);
            this.userProfile.token = token;
            this.userProfile.id = id;
            this.userProfile.username = credential.username;
            this.userProfile.save();
            return res;
        },

        async logout() {
            setTokenHeader("");
            this.userProfile.remove();
            window.location.href = ROUTE_PATH.DASHBOARD;
        },
    },
});

export function useUserStore() {
    return storeDefinition(store);
}
