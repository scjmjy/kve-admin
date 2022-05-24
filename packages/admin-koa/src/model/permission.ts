import mongoose from "mongoose";
import { IPermission, StatusEnum, PermissionTypeEnum } from "admin-common";

export const MODEL_NAME_PERMISSION = "Permission";

interface IPermissionDoc extends IPermission {}

interface IPermissionModel extends mongoose.Model<IPermissionDoc> {}

export const PermissionSchema = new mongoose.Schema<IPermissionDoc, IPermissionModel>(
    {
        name: { type: String },
        code: { type: String, required: true, unique: true },
        type: { type: String, enum: PermissionTypeEnum },
        path: { type: String },
        layout: { type: String },
        component: { type: String },
        redirect: { type: String },
        status: { type: String, enum: StatusEnum },
        children: [{ type: mongoose.Types.ObjectId, ref: MODEL_NAME_PERMISSION }],
        title: { type: String, required: true },
        icon: String,
        pinned: Boolean,
        cacheable: Boolean,
        visible: Boolean,
        forName: String,
        pathKey: String,
        iframe: String,
        description: { type: String },
    },
    {
        timestamps: true,
    },
);
PermissionSchema.pre("save", function (next) {
    if (!this.status) {
        this.status = "enabled";
    }
    next();
});
PermissionSchema.pre("insertMany", function (next: mongoose.CallbackWithoutResultAndOptionalError, docs: any[]) {
    for (const doc of docs) {
        if (!doc.status) {
            doc.status = "enabled";
        }
    }
    next();
});
PermissionSchema.pre(["find", "findOne"], function (next) {
    const query = this.getQuery();
    if (!query.status) {
        query.status = "enabled";
    }

    const opt = this.getOptions();
    if (opt.doPopulate) {
        this.populate({
            path: "children",
            match: {
                status: query.status,
            },
            options: {
                doPopulate: true, // 深度 populate
            },
        });
    }
    next();
});

export const PermissionModel = mongoose.model<IPermissionDoc, IPermissionModel>(
    MODEL_NAME_PERMISSION,
    PermissionSchema,
);
