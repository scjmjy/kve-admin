import { defineStore } from "pinia";
import { IPermission, LoginCredential, UpdateUserProfile } from "admin-common";
import { store } from "@/store";
import { login, getUserProfile, updateUserProfile, uploadUserAvatar } from "@/api/user";
import { setTokenHeader } from "@/api/request";
import { UserProfile } from "@/api/model/user";
import { ROUTE_PATH } from "@/router/consts";
import { addServerRoutes } from "@/router/routes";

function extractPermCodes(perms: IPermission[]) {
    const codes: string[] = [];
    for (const perm of perms) {
        codes.push(perm.code);
        if (perm.children && perm.children.length) {
            codes.push(...extractPermCodes(perm.children));
        }
    }
    return codes;
}

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
        async getUserProfile(perms = false) {
            const res = await getUserProfile(perms);
            Object.assign(this.userProfile, res.data);
            if (res.data.perms) {
                addServerRoutes(res.data.perms);
                this.userProfile.perms = extractPermCodes(res.data.perms);
            }
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
        async logout() {
            this.cleanup();
            window.location.href = ROUTE_PATH.DASHBOARD;
        },
        cleanup() {
            setTokenHeader("");
            this.userProfile.removeToken();
        },
        /**
         *
         * @param code 权限标识
         * @param some 如果 code 是数组，some=true：只要数组中有一个匹配了，就返回 true；some=false，数组中全都匹配才会返回 true
         */
        hasPerm(code: string | string[], some = false) {
            code = Array.isArray(code) ? code : [code];
            const func = some ? "some" : "every";
            return code[func]((item) => this.userProfile.perms.includes(item));
        },
    },
});

export function useUserStore() {
    return storeDefinition(store);
}
