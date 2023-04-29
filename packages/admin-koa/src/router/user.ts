import Router from "@koa/router";
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
    forceLogout,
    postLogin,
    delLogout,
} from "@/controllers/user";
import { hasPerm } from "@/middlewares/permission";

export const userRouter = new Router<any, any>({
    prefix: "/user",
});

const hasPerm_usermanage = hasPerm([PERM_CODES.system, PERM_CODES.system_usermanage]);
const hasPerm_onlineuers = hasPerm([PERM_CODES.system, PERM_CODES.monitor_onlineusers]);
const hasPerm_onlineuers_forceLogout = hasPerm([PERM_CODES.system, PERM_CODES.monitor_onlineusers_forceLogout]);

userRouter
    .post("/login", postLogin)
    .delete("/logout", delLogout)
    .get("/profile", getUserProfile)
    .put("/profile", putUserProfile)
    .put("/password", putUserPassword)
    .put("/avatar", putUserAvatar)
    .get("/avatar/:userId", getUserAvatar)
    .post("/", hasPerm_usermanage, postUser)
    .put("/", hasPerm_usermanage, putUser)
    .delete("/:userId", hasPerm_usermanage, deleteUser)
    .put("/status/:status", hasPerm_usermanage, putEnableUsers)
    .post("/list", hasPerm_usermanage, postFindUsers)
    .get("/list/online", hasPerm_onlineuers, getOnlineUsers)
    .delete("/list/online/forceLogout/:sessionId", hasPerm_onlineuers, hasPerm_onlineuers_forceLogout, forceLogout);
