import mongoose from "mongoose";
import { IDepartment, IRole } from "admin-common";
import { MODEL_NAME_USER } from "./user";

export const MODEL_NAME_ROLE = "Role";

interface IRoleDoc extends IRole {}

interface IRoleModel extends mongoose.Model<IRoleDoc> {}

export const RoleSchema = new mongoose.Schema<IRoleDoc, IRoleModel>(
    {
        name: { type: String, required: true },
        orderNo: { type: Number, required: true },
        status: { type: String, required: true },
        description: { type: String },
    },
    {
        timestamps: true,
    },
);

export const RoleModel = mongoose.model<IRoleDoc, IRoleModel>(MODEL_NAME_ROLE, RoleSchema);

export const MODEL_NAME_DEPARTMENT = "Department";

interface IDepartmentDoc extends IDepartment {}

interface IDepartmentModel extends mongoose.Model<IDepartmentDoc> {}

export const DepartmentSchema = new mongoose.Schema<IDepartmentDoc, IDepartmentModel>(
    {
        name: { type: String, required: true, unique: true },
        orderNo: { type: Number, required: true },
        status: { type: String, required: true },
        depts: [{ type: mongoose.Types.ObjectId, ref: MODEL_NAME_DEPARTMENT }],
        roles: [{ type: mongoose.Types.ObjectId, ref: MODEL_NAME_ROLE }],
        managers: [{ type: mongoose.Types.ObjectId, ref: MODEL_NAME_USER }],
        description: { type: String },
    },
    {
        timestamps: true,
    },
);

const preFind: mongoose.PreMiddlewareFunction<mongoose.Query<any, any>> = function (next) {
    this.populate([
        "depts",
        "roles",
        {
            path: "managers",
            select: "name",
        },
    ]);
    next();
};

DepartmentSchema.pre(["find", "findOne"], preFind);

export const DepartmentModel = mongoose.model<IDepartmentDoc, IDepartmentModel>(
    MODEL_NAME_DEPARTMENT,
    DepartmentSchema,
);
