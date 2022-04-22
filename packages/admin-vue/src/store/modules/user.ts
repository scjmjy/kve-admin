import { defineStore } from "pinia";
import { LoginCredential, UpdateUserProfile } from "admin-common";
import { ROUTE_PATH } from "@/router/consts";
import { setTokenHeader } from "@/api/request";
import { login, getUserProfile, updateUserProfile, uploadUserAvatar } from "@/api/user";
import { UserProfile } from "@/api/model/user";
import { store } from "@/store";
import { loadStorableObject } from "@/utils/storage";

const storeDefinition = defineStore({
    id: "user",
    state: () => {
        const userProfile = new UserProfile();
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
            const { token, id } = res.data;
            setTokenHeader(token);
            this.userProfile.token = token;
            this.userProfile.username = credential.username;
            this.userProfile.saveToken();
            return res;
        },
        async getUserProfile() {
            const res = await getUserProfile();
            Object.assign(this.userProfile, res.data);
            return this.userProfile;
        },
        async updateUserProfile(body: UpdateUserProfile) {
            await updateUserProfile(body);
            Object.assign(this.userProfile, body);
            return this.userProfile;
        },
        async uploadUserAvatar(base64: string) {
            await uploadUserAvatar(base64);
            this.userProfile.avatar = ''; // 更新 avatar 的时间戳
        },
        async logout() {
            this.cleanup();
            window.location.href = ROUTE_PATH.DASHBOARD;
        },
        cleanup() {
            setTokenHeader("");
            this.userProfile.removeToken();
        },
    },
});

export function useUserStore() {
    return storeDefinition(store);
}
