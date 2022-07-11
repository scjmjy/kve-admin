<template>
    <div class="indexPage">
        <el-card header="项目介绍">
            <el-descriptions border :column="column">
                <el-descriptions-item label="项目名称">
                    KVE 全栈后端管理系统
                    <el-tag type="success">@1.1.0</el-tag>
                    <el-tag type="danger" style="margin-left: 5px">￥ 免费开源</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="名称含义">
                    <div style="font-family: monospace">
                        K: <el-tag>koa2</el-tag> <br />
                        V: <el-tag>vue3</el-tag><br />
                        E: <el-tag>element-plus2</el-tag>
                    </div>
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div>前端技术栈</div>
                        <p class="is-flex is-between">
                            Vue.js:
                            <el-tag>3.2.37</el-tag>
                        </p>
                        <p class="is-flex is-between">
                            Vite:
                            <el-tag>2.9.12</el-tag>
                        </p>
                        <p class="is-flex is-between">
                            TypeScript:
                            <el-tag>4.7.4</el-tag>
                        </p>
                    </template>
                    <table class="is-full" border="1" style="text-align: center">
                        <thead>
                            <tr>
                                <th>库名称</th>
                                <th>版本</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>vue-router</td>
                                <td>
                                    <el-tag>4.0.16</el-tag>
                                </td>
                            </tr>
                            <tr>
                                <td>pinia</td>
                                <td>
                                    <el-tag>2.0.14</el-tag>
                                </td>
                            </tr>
                            <tr>
                                <td>element-plus</td>
                                <td>
                                    <el-tag>2.2.6</el-tag>
                                </td>
                            </tr>
                            <tr>
                                <td>echarts</td>
                                <td>
                                    <el-tag>5.3.3</el-tag>
                                </td>
                            </tr>
                            <tr>
                                <td>axios</td>
                                <td>
                                    <el-tag>0.27.2</el-tag>
                                </td>
                            </tr>
                            <tr>
                                <td>sass</td>
                                <td>
                                    <el-tag>1.53.0</el-tag>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div>后端技术栈</div>
                        <p class="is-flex is-between">
                            Koa.js:
                            <el-tag>2.13.4</el-tag>
                        </p>
                        <p class="is-flex is-between">
                            mongoose:
                            <el-tag>6.4.0</el-tag>
                        </p>
                        <p class="is-flex is-between">
                            ioredis:
                            <el-tag>5.0.6</el-tag>
                        </p>
                        <p class="is-flex is-between">
                            TypeScript:
                            <el-tag>4.6.4</el-tag>
                        </p>
                    </template>
                    <table class="is-full" border="1" style="text-align: center">
                        <thead>
                            <tr>
                                <th>中间件</th>
                                <th>版本</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>koa-jwt</td>
                                <td>
                                    <el-tag>4.0.3</el-tag>
                                </td>
                            </tr>
                            <tr>
                                <td>koa-bodyparser</td>
                                <td>
                                    <el-tag>4.3.0</el-tag>
                                </td>
                            </tr>
                            <tr>
                                <td>koa-router</td>
                                <td>
                                    <el-tag>10.1.1</el-tag>
                                </td>
                            </tr>
                            <tr>
                                <td>koa-session</td>
                                <td>
                                    <el-tag>6.2.0</el-tag>
                                </td>
                            </tr>
                            <tr>
                                <td>koa-static</td>
                                <td>
                                    <el-tag>5.0.0</el-tag>
                                </td>
                            </tr>
                            <tr>
                                <td>log4js</td>
                                <td>
                                    <el-tag>6.5.2</el-tag>
                                </td>
                            </tr>
                            <tr>
                                <td>rate-limiter-flexible</td>
                                <td>
                                    <el-tag>2.3.7</el-tag>
                                </td>
                            </tr>
                            <tr>
                                <td>sharp</td>
                                <td>
                                    <el-tag>0.30.7</el-tag>
                                </td>
                            </tr>
                            <tr>
                                <td>@koa/multer</td>
                                <td>
                                    <el-tag>3.0.0</el-tag>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-descriptions-item>
                <el-descriptions-item label="项目特色">
                    <ol>
                        <li>前后端均采用 TypeScript 编写，一人即可搞定前后端开发</li>
                        <li>使用 yarn workspace 管理前后端项目，开发起来仿佛一个项目</li>
                        <li>
                            优雅的系统功能
                            <ul>
                                <li>易用的部门/角色/用户管理系统，拖拽式排序重组</li>
                                <li>易用的权限菜单系统，拖拽式排序重组</li>
                                <li>一致的前后端错误机制</li>
                                <li>基于 MongoDB GridFS 的文件上传、下载、预览</li>
                                <li>低代码增删改查组件和后端接口</li>
                                <li>完备且易用的路由功能，内置路由懒加载动画</li>
                                <li>编程式的响应式设计、暗黑模式</li>
                                <li>ElementPlus 图标和精灵图标</li>
                            </ul>
                        </li>
                    </ol>
                </el-descriptions-item>
                <el-descriptions-item>
                    <template #label>
                        <div>学习交流</div>
                        &
                        <div>商业合作</div>
                    </template>
                    <p>
                        项目地址：
                        <el-link
                            type="primary"
                            target="_blank"
                            href="https://github.com/scjmjy/kve-admin.git"
                            style="margin-right: 12px"
                        >
                            <SvgIcon icon="icon-github" :size="24" color="var(--el-text-color-primary)"></SvgIcon>
                        </el-link>
                    </p>
                    <p>
                        QQ交流群：<el-button @click="previewQQGroup">
                            <template #icon>
                                <SvgIcon icon="icon-qq" color="#6BC839" :size="20"></SvgIcon>
                            </template>
                        </el-button>
                    </p>

                    <div>
                        作者微信：<el-button @click="previewWx">
                            <template #icon>
                                <SvgIcon icon="icon-wx" color="#6BC839" :size="20"></SvgIcon>
                            </template>
                        </el-button>
                    </div>
                    <div>
                        <blockquote
                            style="
                                border-left: 5px solid #eee;
                                margin-inline-start: 6px;
                                padding-left: 6px;
                                color: var(--el-color-danger);
                            "
                        >
                            寻找一份可以 <strong>远程办公</strong> 的工作岗位！
                        </blockquote>
                    </div>
                </el-descriptions-item>
                <el-descriptions-item label="捐赠支持">
                    <div>开源不易，需要鼓励</div>
                    <img :src="img_pay" @click="previewPay" />
                </el-descriptions-item>
            </el-descriptions>
        </el-card>
        <el-image-viewer
            v-if="previewUrlList.length"
            :url-list="previewUrlList"
            teleported
            hide-on-click-modal
            @close="previewUrlList.length = 0"
        />
    </div>
</template>

<script setup lang="ts" name="Introduction">
import { useResponsiveCollumn } from "@/composables/useDescriptions";
import { onActivated, ref } from "vue";
import img_wx from "@/assets/imgs/kve/WX.png";
import img_qq_1 from "@/assets/imgs/kve/QQ-KVE-1.png";
import img_pay from "@/assets/imgs/kve/Pay-WX_ZFB.png";

const count = ref(0);

onActivated(() => {
    count.value++;
});

const { column } = useResponsiveCollumn({
    lg: 2,
    xl: 2,
});

const previewUrlList = ref<string[]>([]);

function previewWx() {
    previewUrlList.value = [img_wx];
}

function previewQQGroup() {
    previewUrlList.value = [img_qq_1];
}

function previewPay() {
    previewUrlList.value = [img_pay];
}
</script>

<style scoped lang="scss">
.indexPage {
    img {
        margin: 10px;
        width: calc(50% - 20px);
    }
}
</style>
