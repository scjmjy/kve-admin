import { StorableObject } from "@/utils/storage";

export class UserProfile extends StorableObject {
    static STORAGE_KEY = "STORAGE_KEY_USER";

    constructor(public username = "", public id = "", public avatar = "", public token = "") {
        super(UserProfile.STORAGE_KEY);
    }
}
