import { UserModel } from "@/model/user";
export async function seedUsers() {
    const numUsers = await UserModel.estimatedDocumentCount();
    if (numUsers === 0) {
        const superadmin = new UserModel({
            username: "superadmin",
            realname: "Super Admin",
            password: "123456",
        });
        superadmin.save();
        const dev01 = new UserModel({
            username: "dev01",
            realname: "Developer 1",
            password: "123456",
        });
        dev01.save();

        console.log("[MONGO]: Seeded Users");
    } else {
        //
    }
}
