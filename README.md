# KVE 全栈后台管理系统

- [1. 介绍](#1-介绍)
- [2. TODOs](#2-todos)
- [3. 本地开发](#3-本地开发)
  - [3.1. 第一步：部署 mongodb 并初始化数据](#31-第一步部署-mongodb-并初始化数据)
  - [3.2. 第二步：部署 redis](#32-第二步部署-redis)
  - [3.3. 第三步：安装项目依赖](#33-第三步安装项目依赖)
  - [3.4. 第四步：启动后端](#34-第四步启动后端)
  - [3.5. 第五步：启动前端](#35-第五步启动前端)
- [4. 部署](#4-部署)

## 1. 介绍

后端使用 Koa2，前端使用 Vue3 + ElementPlus2，因此取名为 KVE 全栈后台管理系统。

数据库使用 MongoDB。

前后端均使用 Typescript，代码逻辑清晰、精炼。

更多介绍请前往在线预览地址：http://kve.iflyit.top:3000

## 2. TODOs

- [ ] 代码注释
- [ ] 前后端：部门、角色支持跨层拖拽
- [ ] 前端：更多 Echarts 图表示例
- [ ] 后端：单元测试
- [ ] 前后端：操作日志可视化
- [ ] 前后端：访问日志可视化
- [ ] 其他...

## 3. 本地开发

预置开发环境：

- Windows 或 Windows WSL2(Ubuntu20.04) 或 Mac 或 Linux 
- Node v16.x.x
- Yarn v1.x.x
- VS Code
  - 推荐使用插件包： Vue Volar extension Pack
  - 其中 Vue Language Features (Volar) 是必要的插件

### 3.1. 第一步：部署 mongodb 并初始化数据

- 方式一：[使用 Atlas Cluster（推荐）](./doc/mongodb/AtlasCluster.md)
- 方式二：在 Ubuntu 上部署 MongoDB Replica Set，教程：略
- 方式三：在 Ubuntu 上使用 Docker 部署 MongoDB Replica Set，教程：略

> 你也可以跳过此步骤，使用源码中默认的 MongoDB Atlas Cluster，但这是只读的（任何写入 MongoDB 的操作都会失败）。

### 3.2. 第二步：部署 redis

- 方式一：Docker, 教程：略
- 方式二：Ubuntu, 教程：略

### 3.3. 第三步：安装项目依赖

```bash
# 项目根目录下执行
yarn
```

> 安装 sharp 时可能会出错，这是网络原因，可以多试几次，或自行百度解决。

### 3.4. 第四步：启动后端

修改配置：

```ts
// 项目根目录/packages/admin-koa/src/config/index.ts
export const appConfig: AppConfig = {
    ......
    jwtSecret: "<你的 jwt secret>",
    mongodbBiz: "mongodb+srv://<管理员名称>:<管理员密码>@<集群名字>.ydfnfii.mongodb.net/biz?retryWrites=true&w=majority",
    mongodbGridFS: "mongodb+srv://<管理员名称>:<管理员密码>@<集群名字>.ydfnfii.mongodb.net/gridfs?retryWrites=true&w=majority",
    redis: {
        host: "127.0.0.1",
        port: 6379,
        ......
    }
    ......
};
```

```bash
# 项目根目录下执行
yarn dev:koa
```

### 3.5. 第五步：启动前端

```bash
# 项目根目录下执行
yarn build:common # admin-common 代码变动后，执行此命令后才能生效
yarn dev:vue
```

浏览器访问：https://localhost:14400

## 4. 部署

为了简化流程，后端直接托管前端打包后的静态文件。

```bash
# 项目根目录下执行
yarn build
yarn preview # 预览
# 或者
yarn build
cd packages/admin-koa/scripts
./start.sh
```
浏览器访问：http://localhost:3000

> 注意前缀是 http，如果想要支持 https，请百度搜索关键词 `koa2 https`
