import mongoose from "mongoose";
import { IRole } from "admin-common";

interface IRoleDoc extends IRole {}

interface IRoleModel extends mongoose.Model<IRoleDoc> {}

export const RoleSchema = new mongoose.Schema<IRoleDoc, IRoleModel>({
    name: { type: String, required: true, unique: true },
    description: { type: String},
});

export const RoleModel = mongoose.model<IRoleDoc, IRoleModel>("Role", RoleSchema);
 