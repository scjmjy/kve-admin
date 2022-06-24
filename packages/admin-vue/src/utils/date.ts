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
    date: dayjs.Dayjs | Date | string | number,
    format: CommonDateFormat = "YYYY-MM-DD HH:mm:ss",
): string {
    let d: dayjs.Dayjs | undefined = undefined;
    if (date instanceof Date) {
        d = dayjs(date);
    } else if (typeof date === "string" || typeof date === "number") {
        d = dayjs(new Date(date));
    } else if (date instanceof dayjs.Dayjs) {
        d = date;
    }

    return d?.format(format) || "";
}
