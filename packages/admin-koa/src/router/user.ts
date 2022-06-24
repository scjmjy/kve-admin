import Router from "koa-router";
import { PERM_CODES } from "admin-common";
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
    getOnlineUsers,
} from "@/controllers/user";
import { hasPerm } from "@/middlewares/permission";

export const userRouter = new Router<any, any>({
    prefix: "/user",
});

const hasPerm_usermanage = hasPerm(PERM_CODES.system_usermanage);
const hasPerm_onlineuers = hasPerm(PERM_CODES.system_onlineusers);

userRouter
    .get("/profile", getUserProfile)
    .put("/profile", putUserProfile)
    .put("/password", putUserPassword)
    .put("/avatar", putUserAvatar)
    .get("/avatar/:userId", getUserAvatar)
    .use(hasPerm_usermanage)
    .post("/", postUser)
    .put("/", putUser)
    .delete("/:userId", deleteUser)
    .put("/status/:status", putEnableUsers)
    .post("/list", postFindUsers)
    .use(hasPerm_onlineuers)
    .get("/list/online", getOnlineUsers);
