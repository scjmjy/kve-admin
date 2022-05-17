import { Gender, IPermission, UserProfileResult } from "admin-common";

const STORAGE_KEY_USER_TOKEN = "STORAGE_KEY_USER_TOKEN";
const STORAGE_KEY_USER_AVATAR_TIMESTAMP = "STORAGE_KEY_USER_AVATAR_TIMESTAMP";

export class UserProfile implements Omit<UserProfileResult, "perms"> {
    constructor(
        public _id = "",
        public username = "",
        public realname = "",
        public email = "",
        public mobileno = "",
        public gender: Gender = "UNKNOWN",
        public depts: UserProfileResult["depts"] = [],
        public roles: UserProfileResult["roles"] = [],
        public createdAt = "",
        public updatedAt = "",
        public perms: string[] = [],
    ) {
        this.token = localStorage.getItem(STORAGE_KEY_USER_TOKEN) || "";
        this.timestamp = localStorage.getItem(STORAGE_KEY_USER_AVATAR_TIMESTAMP) || "";
        if (!this.timestamp) {
            this.avatar = 1; // 更新 timestamp
        }
    }
    public token: string;
    private timestamp: string;
    get avatar(): string {
        return `/api/user/avatar/${this._id}?t=${this.timestamp}`;
    }
    set avatar(_val: any) {
        this.timestamp = Date.now().toString();
        localStorage.setItem(STORAGE_KEY_USER_AVATAR_TIMESTAMP, this.timestamp);
    }

    saveToken() {
        localStorage.setItem(STORAGE_KEY_USER_TOKEN, this.token);
    }
    removeToken() {
        this._id = "";
        this.token = "";
        localStorage.removeItem(STORAGE_KEY_USER_TOKEN);
    }
}
