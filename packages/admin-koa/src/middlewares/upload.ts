import multer from "@koa/multer";
import { GridFsStorage } from "multer-gridfs-storage";
import { GridFSBucket } from "mongodb";

const storage = new GridFsStorage({
    url: "mongodb://gridfs:33o93o6@localhost:27017/gridfs",
    file(req, file) {
        // console.log("[avatar]", file);
        return file.originalname;
    },
});

export const upload = multer({ storage });

export function getGridFsBucket() {
    const bucket = new GridFSBucket(storage.db, { bucketName: "fs" });
    return bucket;
}
