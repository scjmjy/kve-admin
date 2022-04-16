import dayjs from "dayjs";

export function formatPlain(date: dayjs.Dayjs | Date): string {
    const d = date instanceof Date ? dayjs(date) : date;
    return d.format("YYYYMMDDHHmm");
}

export function currentDateStr() {
    return dayjs(new Date()).format("YYYY-MM-DD");
}
