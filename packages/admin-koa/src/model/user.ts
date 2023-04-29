import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { IUser, StatusEnum } from "admin-common";
import { userService } from "@/services";
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
        status: { type: String, enum: StatusEnum },
        depts: [{ type: mongoose.Types.ObjectId, ref: MODEL_NAME_DEPARTMENT }],
        roles: [{ type: mongoose.Types.ObjectId, ref: MODEL_NAME_ROLE }],
    },
    {
        timestamps: true,
    },
);

UserSchema.plugin(BcryptPlugin).plugin(mongoosePaginate as any);

UserSchema.pre("save", function (next) {
    if (!this.status) {
        this.status = "enabled";
    }
    next();
});
UserSchema.pre("insertMany", function (next: mongoose.CallbackWithoutResultAndOptionalError, docs: any[]) {
    for (const doc of docs) {
        if (!doc.status) {
            doc.status = "enabled";
        }
    }
    next();
});

UserSchema.pre(["find", "findOne"], function (next) {
    const query = this.getQuery();
    if (!query.status) {
        query.status = "enabled";
    }

    const opt = this.getOptions();
    if (opt.doPopulate) {
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
    }
    next();
});

UserSchema.post("insertMany", async function () {
    userService && (await userService.deleteCache());
});

UserSchema.post(["save", "remove", "deleteOne", "updateOne"], async function () {
    userService && (await userService.deleteCache(this._id));
});

UserSchema.post(
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
    async function () {
        userService && (await userService.deleteCache());
    },
);

// UserSchema.static("getStatistics", function () {
//     return "100人";
// });

export const UserModel = mongoose.model<IUserDoc, IUserModel>(MODEL_NAME_USER, UserSchema);
