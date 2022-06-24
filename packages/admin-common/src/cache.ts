export interface CacheInfoItem {
    label: string;
    value: string;
}
export interface CacheInfoResult {
    items: CacheInfoItem[];
    columns: { label: string; prop: string }[];
    rows: Record<string, string | number>[];
}
