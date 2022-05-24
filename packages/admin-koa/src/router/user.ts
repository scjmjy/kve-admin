import Router from "koa-router";
import {
    getUserProfile,
    putUserProfile,
    putUserPassword,
    putUserAvatar,
    postFindUsers,
    postUser,
    putUser,
    getUserAvatar,
    deleteUser,
    putEnableUsers,
} from "@/controllers/user";

export const userRouter = new Router<any, any>({
    prefix: "/user",
});

userRouter
    .post("/", postUser)
    .put("/", putUser)
    .delete("/:userId", deleteUser)
    .put("/status/:status", putEnableUsers)
    .get("/profile", getUserProfile)
    .put("/profile", putUserProfile)
    .put("/password", putUserPassword)
    .put("/avatar", putUserAvatar)
    .get("/avatar/:userId", getUserAvatar)
    .post("/list", postFindUsers);
