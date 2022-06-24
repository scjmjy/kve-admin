import { defineStore } from "pinia";
import { omit } from "lodash-unified";
import { IPermission, LoginCredential, UpdateUserProfile, PermMatchMode, hasPerm } from "admin-common";
import { store } from "@/store";
import { login, getUserProfile, updateUserProfile, uploadUserAvatar } from "@/api/user";
import { setTokenHeader } from "@/api/request";
import { UserProfile } from "@/api/model/user";
import { ROUTE_PATH } from "@/router/consts";
import { addServerRoutes } from "@/router/routes";

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
        async getUserProfile(withPerms = false) {
            const res = await getUserProfile(withPerms);
            Object.assign(this.userProfile, omit(res.data, "perms"));
            const perms = res.data.perms || [];
            addServerRoutes(perms);
            return this.userProfile;
        },
        async updateUserProfile(body: UpdateUserProfile) {
            await updateUserProfile(body);
            Object.assign(this.userProfile, body);
            return this.userProfile;
        },
        async uploadUserAvatar(base64: string) {
            await uploadUserAvatar(base64);
            this.userProfile.avatar = ""; // 更新 avatar 的时间戳
        },
        /**
         * @param relogin 是否回到登录界面
         */
        async logout(relogin = true) {
            this.cleanup();
            if (relogin) {
                window.location.href = ROUTE_PATH.DASHBOARD;
            }
        },
        cleanup() {
            setTokenHeader("");
            this.userProfile.removeToken();
        },
        /**
         *
         * @param code 权限标识
         * @param mode 匹配模式
         * - every: 拥有 code 中所有的权限
         * - some: 拥有 code 中一个或多个的权限
         * - none: code 中的权限一个也没有
         */
        hasPerm(code: string | string[], mode: PermMatchMode): boolean {
            return hasPerm(this.userProfile.permCodes, code, mode);
        },
        isLoggedIn() {
            return this.userProfile._id && this.userProfile.token;
        },
    },
});

export function useUserStore() {
    return storeDefinition(store);
}
