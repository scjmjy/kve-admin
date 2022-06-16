import { extname } from "path";
import { ObjectId } from "bson";
import { AjaxResult } from "admin-common";
import { GridFSBucketReadStream } from "mongodb";
import HttpStatusCodes from "http-status-codes";
import { KoaContext } from "@/types/koa";
import { getGridFsBucket } from "@/middlewares/upload";

async function download(ctx: KoaContext<void, AjaxResult | GridFSBucketReadStream | null, { id: string }>) {
    const id = ctx.params.id;
    if (!id || id.length !== 24) {
        ctx.status = HttpStatusCodes.BAD_REQUEST;
        ctx.body = {
            code: HttpStatusCodes.getStatusText(ctx.status),
            showType: "MESSAGE",
            msg: "文件 ID 格式错误！",
        };
        return;
    }
    const objId = new ObjectId(id);
    const bucket = getGridFsBucket();
    const cursor = bucket.find({
        _id: objId,
    });
    const file = await cursor.next();
    if (!file) {
        ctx.status = HttpStatusCodes.NOT_FOUND;
        ctx.body = {
            code: HttpStatusCodes.getStatusText(ctx.status),
            showType: "MESSAGE",
            msg: "文件或图片未找到！",
        };
    } else {
        const lastModified = file.uploadDate.toString();
        const ifModifiedSince = ctx.headers["if-modified-since"];

        if (ifModifiedSince && lastModified === ifModifiedSince) {
            ctx.status = HttpStatusCodes.NOT_MODIFIED;
            ctx.body = null;
            return;
        }
        let contentType = file.contentType || "";
        const ext = extname(file.filename);
        if (ext === ".7z") {
            contentType = "application/x-7z-compressed";
        }
        ctx.set({
            "Content-Type": contentType,
            "Content-Length": file.length.toString(),
            "Cache-Control": "max-age=10", // 10s内浏览器 disk cache 生效
            "Last-Modified": lastModified, // 10s后如果lastModified和上一次的lastModified(即本次的ifModifiedSince)相同，则304，否则重新下载
        });
        ctx.status = HttpStatusCodes.OK;
        ctx.body = bucket.openDownloadStream(objId);
    }
}

export { download };
