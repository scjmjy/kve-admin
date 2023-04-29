import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { IDemoCollection, StatusEnum } from "admin-common";
import { GridFsSchema } from "./gridfs";

export const MODEL_NAME_DEMOCOLLECTION = "DemoCollection";

interface IDemoCollectionDoc extends IDemoCollection {}

interface IDemoCollectionModel extends mongoose.PaginateModel<IDemoCollectionDoc> {}

export const DemoCollectionSchema = new mongoose.Schema<IDemoCollectionDoc, IDemoCollectionModel>(
    {
        field1: Number,
        field2: String,
        field3: [Number],
        field4: [String],
        status: { type: String, enum: StatusEnum },
        inlineFile: GridFsSchema,
        inlineFileList: [GridFsSchema],
        gridFsFile: GridFsSchema,
        gridFsFileList: [GridFsSchema],
    },
    {
        timestamps: true,
    },
);

DemoCollectionSchema.pre("save", function (next) {
    if (!this.status) {
        this.status = "enabled";
    }
    next();
});
DemoCollectionSchema.pre("insertMany", function (next: mongoose.CallbackWithoutResultAndOptionalError, docs: any[]) {
    for (const doc of docs) {
        if (!doc.status) {
            doc.status = "enabled";
        }
    }
    next();
});
DemoCollectionSchema.pre(["find", "findOne"], function (next) {
    const query = this.getQuery();
    if (!query.status) {
        query.status = "enabled";
    }
    next();
});

DemoCollectionSchema.plugin(mongoosePaginate as any);

export const DemoCollectionModel = mongoose.model<IDemoCollectionDoc, IDemoCollectionModel>(
    MODEL_NAME_DEMOCOLLECTION,
    DemoCollectionSchema,
);
