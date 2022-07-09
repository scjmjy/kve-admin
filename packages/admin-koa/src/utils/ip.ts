import { request } from "./request";

export async function getIpLocation(ip: string): Promise<string> {
    if (ip === "127.0.0.1" || ip === "::ffff:127.0.0.1") {
        return "";
    }
    ip.replace("::ffff:", "");
    const res = await request({
        method: "GET",
        url: "http://whois.pconline.com.cn/ip.jsp?ip=" + ip,
    });
    return res.data || "";
}
