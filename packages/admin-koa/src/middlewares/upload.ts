import koa from "koa";
import { ObjectId } from "bson";
import { GridFSBucket } from "mongodb";
import { GridFile, GridFsStorage, UrlStorageOptions } from "multer-gridfs-storage";
import multer from "@koa/multer";
import { appConfig } from "@/utils/config";

const storage = new GridFsStorage({
    url: appConfig.mongodbConnection,
    file(req, file) {
        return file.originalname;
    },
});

export async function setupUpload(app: koa) {
    const { logger } = app.context;
    const { db, client } = await storage.ready();
    if (!client) {
        logger.debug.error(
            "[Server] setupUpload: MongoDB GridFS 连接失败，url:",
            (storage.configuration as UrlStorageOptions).url,
        );
        return Promise.reject("MongoDB GridFS 连接失败");
    } else {
        storage.db = client.db("gridfs");
    }
    logger.debug.info("[Server] setupUpload: 连接成功");
}

export const upload = multer({
    storage,
    limits: {
        fieldSize: 16 * 1024 * 1024, // 16MB
    },
});

export function getGridFsBucket() {
    // @ts-ignore
    const bucket = new GridFSBucket(storage.db, { bucketName: "fs" });
    return bucket;
}

export async function findGridFsFile(id: string) {
    const objId = new ObjectId(id);
    const bucket = getGridFsBucket();
    const cursor = bucket.find({
        _id: objId,
    });
    const file = await cursor.next();
    return file;
}

export async function deleteGridFsFile(id: string) {
    const objeId = new ObjectId(id);
    const bucket = getGridFsBucket();
    await bucket.delete(objeId);
}

declare module "@koa/multer" {
    interface File extends Omit<GridFile, "id"> {
        id: ObjectId;
    }
}
