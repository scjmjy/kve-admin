<template>
    <div class="indexPage">
        <h1>KVE全栈后端管理系统 介绍</h1>
        <p>后端使用 Koa，前端使用 Vue3 + ElementPlus，因此取名为 KVE 全栈后台管理系统。</p>
        数据库使用 MongoDB。
        <p>前后端均使用 Typescript，代码逻辑清晰、精炼。</p>
        <p>目前包含功能：</p>
        <ol>
            <li>登录</li>
            <li>个人资料</li>
            <li>
                优雅的路由功能
                <ul>
                    <li>路由缓存</li>
                    <li>动态参数路由</li>
                    <li>多级嵌套路由</li>
                    <li>基于后端“角色系统+权限菜单”的路由过滤</li>
                </ul>
            </li>
            <li>
                文件上传、下载、预览
                <ul>
                    <li>基于 MongoDB + GridFs</li>
                    <li>识别多种图片/视频/Office文件格式</li>
                </ul>
            </li>
            <li>
                优雅的增删改查
                <ul>
                    <li>CrudForm, CrudFormDlg, CrudTable 组件：快速搭建增删改查业务</li>
                    <li>配合 MongoDB + GridFs，调用一次接口同时 POST/PUT 表单数据和文件数据</li>
                    <li>优雅的分页和过滤功能</li>
                </ul>
            </li>
            <li>
                优雅的图标组件 SvgIcon，自动识别以下类型图标：
                <ul>
                    <li>自定义 svg 文件图标</li>
                    <li>ElementPlus Icons</li>
                </ul>
            </li>
            <li>ElementPlus 自带的暗黑模式</li>

            <li>
                优雅的响应式设计
                <ul>
                    <li>可编程的响应式设计</li>
                </ul>
            </li>
            <li>
                优雅的部门、角色、用户管理系统
                <ul>
                    <li>部门、角色、用户的关系清晰明朗</li>
                    <li>易于管理维护</li>
                </ul>
            </li>

            <li>
                优雅的权限菜单管理系统
                <ul>
                    <li><code>page-***.vue</code> 自动识别为页面组件</li>
                    <li>易于管理维护</li>
                </ul>
            </li>

            <li>
                优雅的前后端错误机制
                <ul>
                    <li>后端可控制错误信息在前端的显示方式、显示内容以及显示与否</li>
                </ul>
            </li>
            <li>......</li>
        </ol>

        <p>此项目包含三个子项目，使用 yarn workspace 管理：</p>
        <ol>
            <li>packages/admin-common: 前后端通用代码库</li>
            <li>packages/admin-koa: 后端项目</li>
            <li>packages/admin-vue: 前端项目</li>
        </ol>
        <!-- <img src="/static/img/板球.png" alt=""> -->
    </div>
</template>

<script setup lang="ts" name="DashboardIndex">
import { onActivated, ref } from "vue";

const count = ref(0);

onActivated(() => {
    count.value++;
});
</script>

<style scoped lang="scss">
.indexPage {
    img {
        margin: 10px;
        width: calc(50% - 20px);
    }
}
</style>
