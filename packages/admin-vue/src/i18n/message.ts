import { Gender } from "admin-common";

const Message = new Map<string, string>();
Message.set("gender." + Gender.MALE, "男");
Message.set("gender." + Gender.FEMALE, "女");
Message.set("gender." + Gender.UNKNOWN, "未知");

export function i18n(key: string) {
    return Message.get(key);
}
