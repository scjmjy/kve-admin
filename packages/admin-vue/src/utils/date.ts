import dayjs from "dayjs";

// export function formatPlain(date: dayjs.Dayjs | Date): string {
//     const d = date instanceof Date ? dayjs(date) : date;
//     return d.format("YYYYMMDDHHmm");
// }

// export function currentDateStr() {
//     return dayjs(new Date()).format("YYYY-MM-DD");
// }

export type CommonDateFormat = "YYYY-MM-DD HH:mm:ss" | "YYYY-MM-DD HH:mm" | "YYYY-MM-DD";

export function formatDate(
    date: dayjs.Dayjs | Date | string,
    format: CommonDateFormat = "YYYY-MM-DD HH:mm:ss",
): string {
    const d = date instanceof Date ? dayjs(date) : typeof date === "string" ? dayjs(new Date(date)) : date;
    return d.format(format);
}
