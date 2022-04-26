import mongoose from "mongoose";
import { IPermission, StatusEnum, PermissionTypeEnum } from "admin-common";
import type { MiddlewareQuery } from "@/controllers/utils";

export const MODEL_NAME_PERMISSION = "Permission";

interface IPermissionDoc extends IPermission {}

interface IPermissionModel extends mongoose.Model<IPermissionDoc> {}

export const PermissionSchema = new mongoose.Schema<IPermissionDoc, IPermissionModel>(
    {
        name: { type: String },
        code: { type: String, required: true },
        type: { type: String, enum: PermissionTypeEnum },
        path: { type: String },
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
PermissionSchema.pre(["find", "findOne"], function (next) {
    const filter = this.getFilter() as MiddlewareQuery<any>;
    if (filter.doPopulate) {
        this.populate([
            {
                path: "children",
                match: {
                    doPopulate: true, // 深度 populate
                },
            },
        ]);
    }
    next();
});

export const PermissionModel = mongoose.model<IPermissionDoc, IPermissionModel>(
    MODEL_NAME_PERMISSION,
    PermissionSchema,
);
