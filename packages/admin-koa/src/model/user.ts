import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { IUser } from "admin-common";
import { BcryptPlugin } from "./plugin/bcrypt";
import { MODEL_NAME_DEPARTMENT, MODEL_NAME_ROLE } from "./department";

export const MODEL_NAME_USER = "User";

export interface IUserMethods {
    verifyPassword(value: string, cb?: (err: any, valid: boolean) => void): boolean | Promise<boolean>;
}

export interface IUserStatics {
    getStatistics(): string;
}

export type IUserDoc = IUser & IUserMethods;

export type IUserModel = mongoose.PaginateModel<IUserDoc> & IUserStatics;

export const UserSchema = new mongoose.Schema<IUserDoc, IUserModel>(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true, bcrypt: true },
        realname: { type: String },
        email: { type: String },
        mobileno: { type: String },
        gender: { type: String },
        avatar: { type: String },
        thumbnail: { type: String },
        status: { type: String },
        depts: [{ type: mongoose.Types.ObjectId, ref: MODEL_NAME_DEPARTMENT }],
        roles: [{ type: mongoose.Types.ObjectId, ref: MODEL_NAME_ROLE }],
    },
    {
        timestamps: true,
    },
);

UserSchema.plugin(BcryptPlugin).plugin(mongoosePaginate);

const preFind: mongoose.PreMiddlewareFunction<mongoose.Query<any, any>> = function (next) {
    // @ts-ignore
    const filter = this.getFilter() as mongoose.MiddlewareQuery<IUserDoc>;
    if (!filter.includeDeleted && !filter.status) {
        filter.status = {
            $ne: "deleted",
        };
    }
    if (!filter.doPopulate) {
        return next();
    }

    this.populate([
        {
            path: "roles",
            select: "name",
        },
        {
            path: "depts",
            select: "name",
        },
    ]);
    next();
};

UserSchema.pre(["find", "findOne"], preFind);

UserSchema.static("getStatistics", function () {
    return "100人";
});

export const UserModel = mongoose.model<IUserDoc, IUserModel>(MODEL_NAME_USER, UserSchema);
