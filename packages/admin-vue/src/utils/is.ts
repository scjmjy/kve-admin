export function isExternalLink(url: string) {
    return url && typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"));
}
