import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

/**
 * 
 * @param metaUrl import.meta.url
 * @returns import.meta.url 的目录部分
 */
export function __dirname(metaUrl: string) {
    return dirname(fileURLToPath(metaUrl));
}

export function __resolve(metaUrl: string, ...pathSegments: string[]) {
    return resolve(__dirname(metaUrl), ...pathSegments);
}
