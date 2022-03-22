import { StorableObject } from "@/utils/storage";

export class UserInfo extends StorableObject {
    static STORAGE_KEY = "STORAGE_KEY_USER";

    constructor(public userName = "", public id = 0, public avatar = "", public token = "") {
        super(UserInfo.STORAGE_KEY);
    }
}
