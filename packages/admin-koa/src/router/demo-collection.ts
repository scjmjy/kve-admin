import Router from "koa-router";
import {
    deleteDemoCollection,
    getDemoCollection,
    postDemoCollection,
    postFindDemoCollection,
    putDemoCollection,
} from "@/controllers/demo-collection";
import { upload } from "@/middlewares/upload";

export const demoCollRouter = new Router<any, any>({
    prefix: "/demo-collection",
});

demoCollRouter
    .get("/:demoCollId", getDemoCollection)
    .delete("/:demoCollId", deleteDemoCollection)
    .post(
        "/",
        upload.fields([
            {
                name: "gridFsFile",
                maxCount: 1,
            },
            {
                name: "gridFsFileList",
                maxCount: 3,
            },
        ]),
        postDemoCollection,
    )
    .put(
        "/",
        upload.fields([
            {
                name: "gridFsFile",
                maxCount: 1,
            },
            {
                name: "gridFsFileList",
                maxCount: 3,
            },
        ]),
        putDemoCollection,
    )
    .post("/list", postFindDemoCollection);
