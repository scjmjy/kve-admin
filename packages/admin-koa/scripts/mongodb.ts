import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { UserModel } from "../src/model/user";
import { DepartmentModel, RoleModel } from "../src/model/department";
import { internalDepts, internalRoles, internalUsers } from "./data/seed-depts";

interface ArgsType {
    bd: string;
    force: boolean;
}

const argv = yargs(hideBin(process.argv))
    // .strict()
    .usage("yarn mongodb seed|drop -d biz|fs|all [-f]")
    .demandCommand(1, "请输入 seed 或 drop 命令")
    .command<ArgsType>({
        command: "seed",
        describe: "Seed database",
        handler(args) {
            switch (args.db) {
                case "biz":
                    seedBiz(args.force)
                        .then(() => {
                            console.log("初始化 biz 数据库成功！");
                            process.exit(0);
                        })
                        .catch((err) => {
                            console.error(err);
                            process.exit(1);
                        });
                    break;
                case "fs":
                    seedGridFs(args.force)
                        .then(() => {
                            console.log("初始化 gridfs 数据库成功！");
                            process.exit(0);
                        })
                        .catch((err) => {
                            console.error(err);
                            process.exit(1);
                        });
                    break;
                case "all":
                    seedAll(args.force)
                        .then(() => {
                            console.log("初始化 biz 和 gridfs 数据库成功！");
                            process.exit(0);
                        })
                        .catch((err) => {
                            console.error(err);
                            process.exit(1);
                        });
                    break;

                default:
                    console.error("请提供数据库名称");
                    process.exit(1);
                    break;
            }
        },
    })
    .command<{ db: string }>({
        command: "drop",
        describe: "Drop database",
        handler(args) {
            switch (args.db) {
                case "biz":
                    emptyBiz()
                        .then(() => {
                            console.log("清空 biz 数据库成功！");
                            process.exit(0);
                        })
                        .catch((err) => {
                            console.error(err);
                            process.exit(1);
                        });
                    break;
                case "fs":
                    emptyGridFs()
                        .then(() => {
                            console.log("清空 gridfs 数据库成功！");
                            process.exit(0);
                        })
                        .catch((err) => {
                            console.error(err);
                            process.exit(1);
                        });
                    break;
                case "all":
                    emptyAll()
                        .then(() => {
                            console.log("清空 biz 和 gridfs 数据库成功！");
                            process.exit(0);
                        })
                        .catch((err) => {
                            console.error(err);
                            process.exit(1);
                        });
                    break;

                default:
                    console.error("请提供数据库名称");
                    process.exit(1);
                    break;
            }
        },
    })
    .alias("h", "help")
    .options({
        force: {
            type: "boolean",
            describe: "seed时, 是否强制删除已存在的数据库",
            alias: "f",
        },
        db: {
            type: "string",
            describe: "biz, fs 或 all",
            alias: "d",
        },
    }).argv;

async function emptyBiz() {
    try {
        const client = new MongoClient("mongodb://mongodbadmin:33o93o6@localhost:27017");
        await client.connect();
        await client.db("biz").dropDatabase();
        await client.close();
    } catch (err) {
        console.error("[emptyBiz]: ", err);
    }
}

async function emptyGridFs() {
    try {
        const client = new MongoClient("mongodb://mongodbadmin:33o93o6@localhost:27017");
        await client.connect();
        await client.db("gridfs").dropDatabase();
        await client.close();
    } catch (err) {
        console.error("[emptyGridFs]: ", err);
    }
}

async function emptyAll() {
    await emptyBiz();
    await emptyGridFs();
}

/**
 *
 * @param force 如果biz数据库存在，force=true👉强制清空，force=false👉报错
 * @returns
 */
async function seedBiz(force = false) {
    console.log("[seedBiz] start");

    let client = new MongoClient("mongodb://mongodbadmin:33o93o6@localhost:27017");
    await client.connect();
    const dbAdmin = client.db("admin").admin();
    const dbs = await dbAdmin.listDatabases({ nameOnly: true });
    if (dbs.databases.find((db) => db.name === "biz")) {
        if (!force) {
            await client.close();
            throw new Error("[seedBiz] biz database already exists");
        } else {
            // 清空 biz 数据库
            const dbBiz = client.db("biz");
            await dbBiz.dropDatabase();
            console.log("[seedBiz] drop biz database");
        }
    } else {
        console.log("[seedBiz] biz database doesn't exist");
    }
    const dbBiz = client.db("biz");
    await dbBiz.command({
        dropAllUsersFromDatabase: 1,
    });
    await dbBiz.addUser("biz", "33o93o6", {
        roles: [
            {
                role: "dbOwner",
                db: "biz",
            },
        ],
    });
    await client.close();

    const m = await mongoose.connect("mongodb://biz:33o93o6@localhost:27017/biz");

    await RoleModel.insertMany(internalRoles);
    console.log("[seedBiz] seed roles");

    await DepartmentModel.insertMany(internalDepts);
    console.log("[seedBiz] seed depts");

    await UserModel.insertMany(internalUsers);
    console.log("[seedBiz] seed users");

    await m.disconnect();
    console.log("[seedBiz] completed!");
}

/**
 *
 * @param force 如果gridfs数据库存在，force=true👉强制清空，force=false👉报错
 * @returns
 */
async function seedGridFs(force = false) {
    let client = new MongoClient("mongodb://mongodbadmin:33o93o6@localhost:27017");
    await client.connect();
    const dbAdmin = client.db("admin").admin();
    const dbs = await dbAdmin.listDatabases({ nameOnly: true });
    if (dbs.databases.find((db) => db.name === "gridfs")) {
        if (!force) {
            await client.close();
            throw new Error("[seedBiz] gridfs database already exists");
        } else {
            // 清空 gridfs 数据库
            const dbGridFs = client.db("gridfs");
            await dbGridFs.dropDatabase();
            console.log("[seedGridFs] drop gridfs database");
        }
    } else {
        console.log("[seedGridFs] gridfs database doesn't exist");
    }

    const dbGridFs = client.db("gridfs");
    await dbGridFs.command({
        dropAllUsersFromDatabase: 1,
    });
    await dbGridFs.addUser("gridfs", "33o93o6", {
        roles: [
            {
                role: "dbOwner",
                db: "gridfs",
            },
        ],
    });
    await client.close();
    console.log("[seedGridFs] completed!");
}

async function seedAll(force = false) {
    await seedBiz(force);
    await seedGridFs(force);
}
