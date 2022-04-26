import { ExternalLinkEnum } from "admin-common";

const pageModules = import.meta.glob("/src/views/**/page-*.vue");

export function usePageModules() {
    const pageModuleOpts = Object.keys(pageModules).map((name) => {
        const match = name.match(/page-(.*).vue$/);
        if (!match || match.length < 1) {
            throw new Error("菜单页面命名错误：" + name);
        }
        return {
            label: match[1],
            value: match[1],
        };
    });
    pageModuleOpts.unshift({
        label: "内嵌外链",
        value: ExternalLinkEnum.ExternalLinkIframe,
    });
    pageModuleOpts.unshift({
        label: "外链",
        value: ExternalLinkEnum.ExternalLink,
    });
    return {
        pageModuleOpts,
    };
}
