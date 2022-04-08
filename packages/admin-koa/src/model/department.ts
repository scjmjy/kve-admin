import mongoose from "mongoose";
import { IDepartment } from "admin-common";

interface IDepartmentDoc extends IDepartment {}

interface IDepartmentModel extends mongoose.Model<IDepartmentDoc> {}

export const DepartmentSchema = new mongoose.Schema<IDepartmentDoc, IDepartmentModel>({
    name: { type: String, required: true, unique: true },
    roles: [{ type: mongoose.Types.ObjectId, ref: "Role" }],
    depts: [{ type: mongoose.Types.ObjectId, ref: "Department" }],
    description: { type: String },
});

export const DepartmentModel = mongoose.model<IDepartmentDoc, IDepartmentModel>("Department", DepartmentSchema);
