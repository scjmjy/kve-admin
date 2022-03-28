import mongoose from "mongoose";
import { IUser } from "admin-common";
import { BcryptPlugin } from "./plugin/bcrypt";

interface IUserDoc extends IUser {
    verifyPassword(value: string, cb?: (err: any, valid: boolean) => void): boolean | Promise<boolean>;
}

interface IUserModel extends mongoose.Model<IUserDoc> {
    getStatistics(): string;
}

const UserSchema = new mongoose.Schema<IUserDoc, IUserModel>({
    username: { type: String, required: true },
    password: { type: String, required: true, bcrypt: true },
    realname: { type: String },
    gender: { type: String },
});

UserSchema.plugin(BcryptPlugin);

UserSchema.static("getStatistics", function () {
    return "100人";
});

export const UserModel = mongoose.model<IUserDoc, IUserModel>("User", UserSchema);
