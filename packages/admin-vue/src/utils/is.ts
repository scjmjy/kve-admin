export function isExternalLink(url: string) {
    return url && /^(https?:|mailto:|tel:)/.test(url);
    // return url && typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"));
}
