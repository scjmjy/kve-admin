/// <reference types="@types/amap-js-api" />

import { Ref, nextTick, ref } from "vue";
import * as echarts from "echarts";
import "echarts-extension-amap";
import type { AMapComponentOption } from "echarts-extension-amap";
import { debounce } from "lodash";
import { tryOnMounted, tryOnUnmounted, useDark } from "@vueuse/core";
import { useDarkMode } from "@/composables/useDarkMode";
import { useAppMainResize } from "./useAppMainResize";
import { useAMap } from "./useAMap";

type SetOptFn = (dark: boolean, oldOpts: echarts.EChartsOption) => echarts.EChartsOption;

export interface EchartInstance {
    getInstance: () => echarts.ECharts;
    setOption(optFn: SetOptFn, clear?: boolean): Promise<void>;
    resize(): void;
}

/**
 *
 * @param elRef 图标容器元素
 * @param amap 是否开启 amap
 * @returns
 */
export function useECharts(elRef: Ref<HTMLDivElement | undefined>, amap = false) {
    const echartInstance = ref<EchartInstance>();
    let chartInstance: echarts.ECharts | undefined = undefined;
    let setOptFn: SetOptFn | undefined = undefined;

    const { isDark } = useDarkMode((dark: boolean) => {
        console.log("[Echarts] - OnDarkModeChanged:" + dark);
        let oldOpt = chartInstance?.getOption();
        initCharts(dark);
        if (chartInstance) {
            if (setOptFn) {
                oldOpt = setOptFn(dark, oldOpt as echarts.EChartsOption);
            }
            oldOpt && chartInstance.setOption(oldOpt);
        }
    });

    function initCharts(dark: boolean) {
        if (!elRef.value) {
            return;
        }
        if (chartInstance) {
            chartInstance.dispose();
            chartInstance = undefined;
        }
        const theme = dark ? "dark" : "light";
        chartInstance = echarts.init(elRef.value, theme);
        console.log("[Echarts] - init, DarkMode:" + dark);
    }

    const echartPromise = new Promise<EchartInstance>((resolve) => {
        tryOnMounted(async () => {
            if (amap) {
                await useAMap();
            }
            const debouncedResize = debounce(
                () => {
                    chartInstance?.resize();
                },
                200,
                { leading: true },
            );
            useAppMainResize(debouncedResize);

            function getInstance(): echarts.ECharts {
                if (!chartInstance) {
                    initCharts(isDark.value);
                }
                return chartInstance!;
            }
            const setOption: EchartInstance["setOption"] = async (optFn, clear = false) => {
                console.log("[Echarts] - setOption");

                setOptFn = optFn;
                if (!elRef.value) {
                    return;
                }
                if (elRef.value.offsetHeight === 0) {
                    await nextTick();
                }

                if (!chartInstance) {
                    initCharts(isDark.value);
                }
                if (chartInstance) {
                    clear && chartInstance.clear();
                    const oldOpt = chartInstance.getOption();
                    chartInstance.setOption(optFn(isDark.value, oldOpt as echarts.EChartsOption));
                }
            };

            echartInstance.value = {
                getInstance: getInstance,
                resize: debouncedResize,
                setOption,
            };
            resolve(echartInstance.value);
        });
    });

    tryOnUnmounted(() => {
        if (!chartInstance) return;
        chartInstance.dispose();
        chartInstance = undefined;
        echartInstance.value = undefined;
        console.log("[Echarts] - tryOnUnmounted");
    });

    return {
        echarts,
        echartInstance,
        echartPromise,
    };
}
declare module "echarts" {
    interface EChartsOption extends AMapComponentOption<AMap.Map.Options> {}
}
