import koa from "koa";
import { request } from "./request";

export async function getIpLocation(ctx: koa.BaseContext, ip: string): Promise<string> {
    // TODO 判断局域网
    if (ip === "127.0.0.1" || ip === "::ffff:127.0.0.1") {
        return "";
    }
    try {
        const res = await request({
            method: "GET",
            url: "http://whois.pconline.com.cn/ip.jsp?ip=" + ip,
            responseType: "arraybuffer",
        });

        if (!res.data) {
            return "";
        }
        const location = new TextDecoder("gbk").decode(res.data);
        return location;
    } catch (err) {
        ctx.logger.debug.error("[getIpLocation] ", ip, err);
        return "";
    }
}
