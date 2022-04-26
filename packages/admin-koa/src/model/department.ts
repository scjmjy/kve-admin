import mongoose from "mongoose";
import { IDepartment, IRole, StatusEnum } from "admin-common";
import { MODEL_NAME_USER } from "./user";
import type { MiddlewareQuery } from "@/controllers/utils";

export const MODEL_NAME_ROLE = "Role";

interface IRoleDoc extends IRole {}

interface IRoleModel extends mongoose.Model<IRoleDoc> {}

export const RoleSchema = new mongoose.Schema<IRoleDoc, IRoleModel>(
    {
        name: { type: String, required: true, unique: true },
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

const preFind: mongoose.PreMiddlewareFunction<mongoose.Query<any, any>> = function (next) {
    const filter = this.getFilter() as MiddlewareQuery<any>;
    // if (!filter.includeDeleted && !filter.status) {
    //     filter.status = {
    //         $ne: "deleted",
    //     };
    // }
    if (filter.doPopulate) {
        this.populate([
            {
                path: "depts",
                match: {
                    doPopulate: true, // 深度 populate
                },
            },
            "roles",
        ]);
    }
    next();
};

DepartmentSchema.pre(["find", "findOne"], preFind);
DepartmentSchema.pre("save", function (next) {
    if (!this.status) {
        this.status = "enabled";
    }
    next();
});

export const DepartmentModel = mongoose.model<IDepartmentDoc, IDepartmentModel>(
    MODEL_NAME_DEPARTMENT,
    DepartmentSchema,
);
