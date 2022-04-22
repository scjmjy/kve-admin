import { Gender } from "admin-common";

const Message = new Map<string, string>();
Message.set("gender." + "MALE", "男");
Message.set("gender." + "FEMALE", "女");
Message.set("gender." + "UNKNOWN", "未知");

export function i18n(key: string) {
    return Message.get(key);
}
