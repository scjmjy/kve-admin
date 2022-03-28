import mongoose from "mongoose";
import { seedUsers } from "./seed/user";

export async function initMongo() {
    try {
        await mongoose.connect("mongodb://entryform:33o93o6@localhost:27017/biz");
        console.log("[MONGO]: Connected to MongoDB Server");
        await seedUsers();
    } catch (err) {
        console.error("[MONGO]: Failed to Connect MongoDB Server", err);
        return Promise.reject();
    }
}
