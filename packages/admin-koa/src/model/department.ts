import mongoose from "mongoose";
import { IDepartment, IRole, StatusEnum } from "admin-common";
import { MODEL_NAME_PERMISSION } from "./permission";
import { deptService, permService, userService } from "@/services";

export const MODEL_NAME_ROLE = "Role";

interface IRoleDoc extends IRole {}

interface IRoleModel extends mongoose.Model<IRoleDoc> {}

export const RoleSchema = new mongoose.Schema<IRoleDoc, IRoleModel>(
    {
        name: { type: String, required: true, unique: true },
        perms: [{ type: mongoose.Types.ObjectId, ref: MODEL_NAME_PERMISSION }],
        status: { type: String, enum: StatusEnum },
        description: { type: String },
    },
    {
        timestamps: true,
    },
);
RoleSchema.pre("save", function (next) {
    if (!this.status) {
        this.status = "enabled";
    }
    next();
});
RoleSchema.pre("insertMany", function (next: mongoose.CallbackWithoutResultAndOptionalError, docs: any[]) {
    for (const doc of docs) {
        if (!doc.status) {
            doc.status = "enabled";
        }
    }
    next();
});

RoleSchema.pre(["find", "findOne"], function (next) {
    const opt = this.getOptions();
    if (opt.doPopulate) {
        this.populate("perms");
    }
    next();
});

RoleSchema.post("insertMany", function (res, next) {
    deptService && deptService.deleteCache();
    next();
});

RoleSchema.post(["save", "remove", "deleteOne", "updateOne"], function (res, next) {
    deptService && deptService.deleteCache();
    permService && permService.deleteCache();
    userService && userService.deleteCache();
    next();
});

RoleSchema.post(
    [
        "deleteMany",
        "deleteOne",
        "findOneAndDelete",
        "findOneAndRemove",
        "findOneAndUpdate",
        "remove",
        "update",
        "updateOne",
        "updateMany",
    ],
    function (res, next) {
        deptService && deptService.deleteCache();
        permService && permService.deleteCache();
        userService && userService.deleteCache();
        next();
    },
);
export const RoleModel = mongoose.model<IRoleDoc, IRoleModel>(MODEL_NAME_ROLE, RoleSchema);

export const MODEL_NAME_DEPARTMENT = "Department";

interface IDepartmentDoc extends IDepartment {}

interface IDepartmentModel extends mongoose.Model<IDepartmentDoc> {}

export const DepartmentSchema = new mongoose.Schema<IDepartmentDoc, IDepartmentModel>(
    {
        name: { type: String, required: true, unique: true },
        status: { type: String, enum: StatusEnum },
        depts: [{ type: mongoose.Types.ObjectId, ref: MODEL_NAME_DEPARTMENT }],
        roles: [{ type: mongoose.Types.ObjectId, ref: MODEL_NAME_ROLE }],
        description: { type: String },
    },
    {
        timestamps: true,
    },
);

DepartmentSchema.pre("save", function (next) {
    if (!this.status) {
        this.status = "enabled";
    }
    next();
});
DepartmentSchema.pre("insertMany", function (next: mongoose.CallbackWithoutResultAndOptionalError, docs: any[]) {
    for (const doc of docs) {
        if (!doc.status) {
            doc.status = "enabled";
        }
    }
    next();
});

DepartmentSchema.pre(["find", "findOne"], function (next) {
    const query = this.getQuery();
    if (!query.status) {
        query.status = "enabled";
    }

    const opt = this.getOptions();
    if (opt.doPopulate) {
        this.populate([
            {
                path: "depts",
                match: {
                    status: query.status,
                },
                options: {
                    doPopulate: true, // 深度 populate
                },
            },
            {
                path: "roles",
                match: {
                    status: query.status,
                },
                options: {
                    doPopulate: true, // 深度 populate
                },
            },
        ]);
    }
    next();
});

DepartmentSchema.post("insertMany", function (res, next) {
    deptService && deptService.deleteCache();
    next();
});

DepartmentSchema.post(["save", "remove", "deleteOne", "updateOne"], function (res, next) {
    deptService && deptService.deleteCache();
    permService && permService.deleteCache();
    userService && userService.deleteCache();
    next();
});

DepartmentSchema.post(
    [
        "deleteMany",
        "deleteOne",
        "findOneAndDelete",
        "findOneAndRemove",
        "findOneAndUpdate",
        "remove",
        "update",
        "updateOne",
        "updateMany",
    ],
    function (res, next) {
        deptService && deptService.deleteCache();
        permService && permService.deleteCache();
        userService && userService.deleteCache();
        next();
    },
);

export const DepartmentModel = mongoose.model<IDepartmentDoc, IDepartmentModel>(
    MODEL_NAME_DEPARTMENT,
    DepartmentSchema,
);
