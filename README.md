# KVE 全栈后台管理系统

- [1. 介绍](#1-介绍)
- [2. 警告](#2-警告)
- [3. 本地开发](#3-本地开发)
  - [3.1. 第一步：部署 mongodb 并初始化数据](#31-第一步部署-mongodb-并初始化数据)
  - [3.2. 第二步：安装项目依赖](#32-第二步安装项目依赖)
  - [3.3. 第三步：启动后端](#33-第三步启动后端)
  - [3.4. 第四步：启动前端](#34-第四步启动前端)
- [4. 部署](#4-部署)
  - [4.1. 前端打包](#41-前端打包)
  - [4.2. 构建后端并运行](#42-构建后端并运行)

## 1. 介绍

后端使用 Koa，前端使用 Vue3 + ElementPlus，因此取名为 KVE 全栈后台管理系统。

数据库使用 MongoDB。

前后端均使用 Typescript，代码逻辑清晰、精炼。

目前包含功能：

1. 登录
2. 个人资料
3. 优雅的路由功能
   - 路由缓存
   - 动态参数路由
   - 多级嵌套路由
   - 基于后端“角色系统+权限菜单”的路由过滤
4. 文件上传、下载、预览
   - 基于 MongoDB + GridFs
   - 识别多种图片/视频/Office文件格式
5. 优雅的增删改查
   - CrudForm, CrudFormDlg, CrudTable 组件：快速搭建增删改查业务
   - 配合 MongoDB + GridFs，调用一次接口同时 POST/PUT 表单数据和文件数据
   - 优雅的分页和过滤功能
6. 优雅的图标组件 SvgIcon，自动识别以下类型图标：
   - 自定义 svg 文件图标
   - ElementPlus Icons
7. ElementPlus 自带的暗黑模式
8. 优雅的响应式设计
   - 可编程的响应式设计
9. 优雅的部门、角色、用户管理系统
   - 部门、角色、用户的关系清晰明朗
   - 易于管理维护
10. 优雅的权限菜单管理系统
    - `page-***.vue` 自动识别为页面组件
    - 易于管理维护
11. 优雅的前后端错误机制
    - 后端可控制错误信息在前端的显示方式、显示内容以及显示与否 
12. ......

此项目包含三个子项目，使用 yarn workspace 管理：

1. packages/admin-common: 前后端通用代码库
2. packages/admin-koa: 后端项目
3. packages/admin-vue: 前端项目

## 2. 警告

此项目可作为学习的材料，最好不要商用，因为目前后端功能比较单一：

- 后端 session 功能不全
- 没有缓存
- 没有日志分析模块
- 没有单元测试用例
- ......

## 3. 本地开发

预置条件：

- Node.js 版本为 v16
- 开发环境为 VS Code + WSL2 或 Mac 或 Linux 

> 如果你是 Windows，并且没有安装 WSL2，那请将所有 package.json 里的 "rm -rf" 修改为 "rm -r"，并使用 PowerShell 作为你的开发终端，而非 Windows CMD。

### 3.1. 第一步：部署 mongodb 并初始化数据

- 方式一：[使用 Atlas Cluster（推荐）](./doc/mongodb/AtlasCluster.md)
- 方式二：在 Ubuntu 上部署 MongoDB Replica Set，教程：略
- 方式三：在 Ubuntu 上使用 Docker 部署 MongoDB Replica Set，教程：略

> 你也可以跳过此步骤，使用作者的 MongoDB Atlas Cluster，但这是只读的（任何写入 MongoDB 的操作都会失败）。

### 3.2. 第二步：安装项目依赖

```bash
# 项目根目录下执行
yarn
```

### 3.3. 第三步：启动后端

修改配置：

```ts
// 项目根目录/packages/admin-koa/src/config/index.ts
export const appConfig: AppConfig = {
    ......
    jwtSecret: "<你的 jwt secret>",
    mongodbBiz: "mongodb+srv://<管理员名称>:<管理员密码>@<集群名字>.ydfnfii.mongodb.net/biz?retryWrites=true&w=majority",
    mongodbGridFs: "mongodb+srv://<管理员名称>:<管理员密码>@<集群名字>.ydfnfii.mongodb.net/gridfs?retryWrites=true&w=majority",
    ......
};
```

```bash
# 项目根目录下执行
yarn dev:koa
```

### 3.4. 第四步：启动前端

```bash
# 项目根目录下执行
yarn build:common # admin-common 代码变动后，执行此命令后才能生效
yarn dev:vue
```

## 4. 部署

为了简化流程，后端直接托管前端打包后的静态文件。

### 4.1. 前端打包

```bash
# 项目根目录下执行
yarn build:common # 如果 admin-common 代码没有变动，则可以跳过此步
yarn build:vue
```

### 4.2. 构建后端并运行

```bash
# 项目根目录下执行
yarn build:common
cd packages/admin-koa
yarn build
yarn preview
```
