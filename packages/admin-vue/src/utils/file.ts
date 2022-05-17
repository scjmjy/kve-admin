import {
    fileIconZip,
    fileIconExcel,
    fileIconWord,
    fileIconPDF,
    fileIconAppendix,
    fileIconPPT,
    fileIconExe,
    fileIconVideo,
    fileIconAudio,
} from "@/assets";
import { isOSX, isiOS } from "./platform";

export function extname(fullname: string) {
    if (!fullname || fullname.length < 2) {
        return "";
    }
    const lastIndex = fullname.lastIndexOf(".");
    return fullname.slice(lastIndex);
}

/**
 * OS X 和 iOS 系统中，1MB = 1000KB， 1KB = 1000bytes
 * 其他系统，1MB = 1024KB，1KB = 1024bytes
 * @param {Number} fileSize 文件大小
 */
export function realSize(fileSize: number) {
    if (isOSX() || isiOS()) {
        return (fileSize * 1000) / 1024;
    }
    return fileSize;
}

const sizeUnitMap = {
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
};

/**
 * 把字符串形式的 size 转换为字节数
 * @param sizeStr 20kb, 1.2KB, 2MB, 1.5mb, 1GB, 2gb
 */
export function parseSize(sizeStr: string) {
    if (!sizeStr || sizeStr.length < 3) {
        return 0;
    }
    const sizePart = sizeStr.slice(0, sizeStr.length - 2);
    const unitPart = sizeStr.slice(-2);
    const size = Number(sizePart);
    if (isNaN(size)) {
        return 0;
    }
    const unit = unitPart.toLowerCase() as keyof typeof sizeUnitMap;
    return (sizeUnitMap[unit] || 0) * size;
}

// /**
//  * B → MB
//  * @param {Number} size size in bytes
//  */
// export function byte2mb(size: number) {
//   const s = Number(size)
//   if (Number.isNaN(s)) {
//     return 0
//   }
//   return s / 1024 / 1024
// }

export function isImg(filename: string, mimetype?: string) {
    if (!mimetype) {
        mimetype = getTypeFromName(filename);
    }
    if (mimetype) {
        return mimetype.startsWith("image/");
    }
    return false;
}

export function isFile(filename: string, mimetype?: string) {
    return !isImg(filename, mimetype);
}

export function isPdf(filename: string, mimetype?: string) {
    const ext = extname(filename);
    if (ext) {
        return ext === ".pdf";
    }
    return mimetype === "application/pdf";
}

export function isAudio(filename: string, mimetype?: string) {
    if (!mimetype) {
        mimetype = getTypeFromName(filename);
    }
    if (mimetype) {
        return mimetype.startsWith("audio/");
    }
    return false;
}

export function isVideo(filename: string, mimetype?: string) {
    if (!mimetype) {
        mimetype = getTypeFromName(filename);
    }
    if (mimetype) {
        return mimetype.startsWith("video/");
    }
    return false;
}

export function getFileIcon(filename: string, mimetype?: string) {
    const ext = extname(filename);
    let icon: any;
    if (ext) {
        icon = getIconFromExt(ext);
    } else if (mimetype) {
        icon = getIconFromType(mimetype);
    }
    return icon || fileIconAppendix;
}

const extMap: Record<string, string | { mime: string; icon: any }> = {
    ".pdf": {
        mime: "application/pdf",
        icon: fileIconPDF,
    },
    ".doc": {
        mime: "application/msword",
        icon: fileIconWord,
    },
    ".docx": {
        mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        icon: fileIconWord,
    },
    ".xls": {
        mime: "application/vnd.ms-excel",
        icon: fileIconExcel,
    },
    ".xlsx": {
        mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        icon: fileIconExcel,
    },
    ".ppt": {
        mime: "application/vnd.ms-powerpoint",
        icon: fileIconPPT,
    },
    ".zip": {
        mime: "application/x-zip-compressed",
        icon: fileIconZip,
    },
    ".7z": {
        mime: "application/x-7z-compressed",
        icon: fileIconZip,
    },
    ".exe": {
        mime: "application/x-msdownload",
        icon: fileIconExe,
    },
    ".m4a": {
        mime: "audio/x-m4a",
        icon: fileIconAudio,
    },
    ".mp3": {
        mime: "audio/mpeg",
        icon: fileIconAudio,
    },
    ".mp4": {
        mime: "video/mp4",
        icon: fileIconVideo,
    },
    ".mpeg": {
        mime: "video/mpeg",
        icon: fileIconVideo,
    },
    ".weba": {
        mime: "audio/weba",
        icon: fileIconAudio,
    },
    ".webm": {
        mime: "audio/webm",
        icon: fileIconVideo,
    },
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
};

export function getExtFromType(mimetype: string) {
    for (const key in extMap) {
        const value = extMap[key];
        if (typeof value === "string") {
            if (value === mimetype) {
                return key;
            }
        } else if (value.mime === mimetype) {
            return key;
        }
    }
    return "";
}

export function getIconFromType(mimetype: string) {
    for (const key in extMap) {
        const value = extMap[key];
        if (typeof value === "object" && value.mime === mimetype) {
            return value.icon;
        }
    }
}

export function getTypeFromName(filename: string): string {
    const ext = extname(filename);
    return getTypeFromExt(ext);
}

export function getTypeFromExt(ext: string): string {
    const value = extMap[ext];
    if (typeof value === "string") {
        return value;
    } else if (value) {
        return value.mime;
    }
    return "";
}

export function getIconFromExt(ext: string) {
    const value = extMap[ext];
    if (typeof value === "object") {
        return value.icon;
    }
}

export function isBlobUrl(url: string) {
    if (url && url.startsWith("blob:")) {
        return true;
    }
    return false;
}

// export function convertBlobUrlToBase64Img(url: string, type?: string) {
//     if (!url || !url.startsWith("blob:")) {
//         return Promise.reject("Blob url 格式错误！");
//     }
//     return new Promise<string>((resolve, reject) => {
//         const image = new Image();
//         image.src = url;
//         image.onload = function () {
//             try {
//                 const canvas = document.createElement("canvas");
//                 canvas.width = image.naturalWidth;
//                 canvas.height = image.naturalHeight;
//                 canvas.getContext("2d")?.drawImage(image, 0, 0);
//                 const result = canvas.toDataURL(type || "image/png");
//                 resolve(result);
//             } catch (error) {
//                 reject(error);
//             }
//         };
//     });
// }

export function convertBlobToBase64(blob: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);

        reader.addEventListener("load", function (e) {
            let base64 = e.target!.result as string;
            const ext = extname(blob.name);
            // 7z 类型的文件
            if (ext === ".7z") {
                base64 = base64.replace("application/octet-stream", "application/x-7z-compressed");
            }
            resolve(base64);
        });

        reader.addEventListener("error", function (e) {
            reject("读取文件错误！");
        });
    });
}
