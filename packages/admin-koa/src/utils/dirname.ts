import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

export function __dirname(metaUrl: string) {
    return dirname(fileURLToPath(metaUrl));
}

export function __resolve(metaUrl: string, ...pathSegments: string[]) {
    return resolve(__dirname(metaUrl), ...pathSegments);
}
