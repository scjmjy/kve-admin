import { MongoClient, Db } from "mongodb";
import mongoose from "mongoose";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { DepartmentModel } from "../src/model/department";
import { RoleModel } from "../src/model/role";
import { UserModel } from "../src/model/user";

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

    const roles = await RoleModel.insertMany([
        {
            name: "超级管理员",
            description: "拥有所有系统权限，一般由开发公司的开发人员持有。",
        },
        {
            name: "管理员",
            description: "拥有大部分系统权限，由开发公司人员或者甲方公司的 IT 人员持有。",
        },
        {
            name: "普通用户",
            description: "没有系统管理权限的普通用户。",
        },
    ]);
    const depts = await DepartmentModel.insertMany([
        {
            name: "开发部门",
            description: "由此项目的开发人员组成。",
            roles: [roles[0]],
        },
        {
            name: "甲方公司",
            description: "甲方公司部门的主节点。",
            roles: [roles[1], roles[2]],
        },
    ]);
    await UserModel.insertMany([
        {
            username: "superadmin",
            realname: "Super Admin",
            password: "123456",
            depts: [depts[0]],
        },
        {
            username: "dev01",
            realname: "Developer 01",
            password: "123456",
            depts: [depts[0]],
        },
        {
            username: "dev02",
            realname: "Developer 02",
            password: "123456",
            depts: [depts[0]],
        },
        {
            username: "user01",
            realname: "User 01",
            password: "123456",
            depts: [depts[1]],
        },
        {
            username: "user02",
            realname: "User 02",
            password: "123456",
            depts: [depts[1]],
        },
        {
            username: "admin01",
            realname: "Admin 01",
            password: "123456",
            depts: [depts[1]],
        },
        {
            username: "admin02",
            realname: "Admin 02",
            password: "123456",
            depts: [depts[1]],
        },
    ]);
    await m.disconnect();
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
}

async function seedAll(force = false) {
    await seedBiz(force);
    await seedGridFs(force);
}
