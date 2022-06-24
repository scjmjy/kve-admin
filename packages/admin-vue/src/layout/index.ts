import DefaultLayout from "@/layout/DefaultLayout.vue";
import FullscreenLayout from "@/layout/FullscreenLayout.vue";
import { FakeLayout } from "@/router/utils";
export enum LayoutEnum {
    default = "DefaultLayout",
    fullscreen = "FullscreenLayout",
}

export function useLayout() {
    return {
        layoutOpts: [
            {
                label: "默认布局",
                value: LayoutEnum.default,
                component: DefaultLayout,
            },
            {
                label: "全屏布局",
                value: LayoutEnum.fullscreen,
                component: FullscreenLayout,
            },
            {
                label: "无",
                value: "",
                component: FakeLayout,
            },
        ],
    };
}
