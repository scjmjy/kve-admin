import { computed, Ref } from "vue";

export type FileAccept = "*" | "image" | "word" | "pdf" | "excel" | "ppt" | "audio" | "video" | "zip" | "exe";
export type FileAcceptProp = FileAccept | FileAccept[];

const FileTypeMap: Record<FileAccept, string> = {
    "*": "*",
    image: "image/jpeg,image/png",
    word: "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pdf: "application/pdf",
    excel: "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    audio: "audio/*",
    video: "video/*",
    zip: "application/x-zip-compressed,application/x-7z-compressed",
    exe: "application/x-msdownload",
};

export function useFileAccept(accept: Ref<FileAcceptProp>) {
    return {
        fileAccept: computed(() => {
            const fileAccept: string[] = [];
            const types = Array.isArray(accept.value) ? accept.value : [accept.value];
            for (const type of types) {
                if (type === "*") {
                    return "";
                }
                fileAccept.push(FileTypeMap[type]);
            }
            return fileAccept.join(",");
        }),
    };
}
