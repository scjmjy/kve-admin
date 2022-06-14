import { ExternalLinkEnum } from "admin-common";
import { RouteRecordRaw } from "vue-router";
import { FakeLayout } from "@/router/utils";
import BlankPage from '@/views/internal/blank.vue';

const pageModules = import.meta.glob("/src/views/**/page-*.vue");

export interface PageModuleOption {
    label: string;
    value: string;
    component: RouteRecordRaw["component"];
}

export function usePageModules() {
    const pageModuleOpts: PageModuleOption[] = Object.entries(pageModules).map(([name, com]) => {
        const match = name.match(/page-(.*).vue$/);
        if (!match || match.length < 1) {
            throw new Error("菜单页面命名错误：" + name);
        }
        return {
            label: match[1],
            value: match[1],
            component: com,
        };
    });
    pageModuleOpts.unshift({
        label: "内嵌外链",
        value: ExternalLinkEnum.ExternalLinkIframe,
        component: BlankPage,
    });
    pageModuleOpts.unshift({
        label: "外链",
        value: ExternalLinkEnum.ExternalLink,
        component: FakeLayout,
    });
    return {
        pageModuleOpts,
    };
}