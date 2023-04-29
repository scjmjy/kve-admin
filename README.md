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
  - [安装 pm2](#安装-pm2)
  - [打包和启动](#打包和启动)
- [Fixes](#fixes)
  - [mongoose-paginate-v2 types](#mongoose-paginate-v2-types)
  - [fix-esm \& tsx](#fix-esm--tsx)

## 1. 介绍

后端使用 Koa2，前端使用 Vue3 + ElementPlus2，因此取名为 KVE 全栈后台管理系统。

数据库使用 MongoDB。

前后端均使用 Typescript，代码逻辑清晰、精炼。

更多介绍请前往在线预览地址：http://kve.iflyit.top:3000

## 2. TODOs

- [ ] 代码注释
- [ ] 前端：更多 Echarts 图表示例
- [ ] 后端：单元测试
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

- 方式一：[使用 Atlas Cluster](./doc/mongodb/AtlasCluster.md)
- 方式二：[在 Ubuntu 上部署 MongoDB Replica Set](https://www.yuque.com/docs/share/1b6fe99a-7bc2-4eb8-bf9d-29c69c15d162)
- 方式三：在 Ubuntu 上使用 Docker 部署 MongoDB Replica Set，教程：略

> 你也可以跳过此步骤，使用源码中默认的 MongoDB 集群，但有时候作者会将其设为只读的（任何写入 MongoDB 的操作都会失败）。

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

```yaml
// 项目根目录/packages/admin-koa/config/default或development或production.yml
Server:
    listenPort: 3000
    keys:
        - kve123456
    jwtSecret: kve123456
    routeDownload: /api/download/

MongoDB:
    connection: "mongodb://admin:kve123456@1.117.98.204:27017,1.117.98.204:27018,1.117.98.204:27019?replicaSet=rs0&retryWrites=true&w=majority"

Redis:
    host: 127.0.0.1
    port: 6379
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

浏览器访问：http://localhost:14400

## 4. 部署

### 安装 pm2

```bash
npm install -g pm2
pm2 install pm2-graceful-intercom # 用于 log4js 集群模式
```
### 打包和启动

为了简化流程，后端直接托管前端打包后的静态文件。

```bash
# 项目根目录下执行
yarn # 更新依赖
yarn build # 打包，注意：vite build 速度比较慢，服务器上运行会卡机
yarn start # 启动
yarn stop # 暂停
```
浏览器访问：http://localhost:3000

> 注意前缀是 http，如果想要支持 https，请百度搜索关键词 `koa2 https`


## Fixes

### mongoose-paginate-v2 types
```ts
// mongoose-paginate-v2/index.d.ts
import mongoose = require('mongoose');
declare function _<Doc>(schema: mongoose.Schema<Doc>): void;
export = _;
```

### fix-esm & tsx
```js
  Module._extensions[".js"] = newLoader;
  // Module._extensions[".mjs"] = newLoader; // comment this line
```
