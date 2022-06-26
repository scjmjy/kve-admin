import multer from "@koa/multer";
import { GridFile, GridFsStorage } from "multer-gridfs-storage";
import { GridFSBucket } from "mongodb";
import { ObjectId } from "bson";
import { appConfig } from "@/config";

const storage = new GridFsStorage({
    url: appConfig.mongodbGridFS,
    file(req, file) {
        return file.originalname;
    },
});

export const upload = multer({
    storage,
    limits: {
        fieldSize: 16 * 1024 * 1024, // 16MB
    },
});

export function getGridFsBucket() {
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
