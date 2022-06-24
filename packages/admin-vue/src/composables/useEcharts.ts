import { Ref, unref, nextTick, watch, computed, ref } from "vue";
import * as echarts from "echarts";
import { debounce } from "lodash";
import { tryOnUnmounted, useDark } from "@vueuse/core";

import { useAppMainResize } from "./useAppMainResize";

export function useECharts(elRef: Ref<HTMLDivElement>) {
    let chartInstance: echarts.ECharts | undefined = undefined;

    const isDark = useDark();

    const theme = computed(() => (isDark.value ? "dark" : "default"));

    watch(
        theme,
        () => {
            initCharts();
        },
        {
            immediate: true,
        },
    );

    const debouncedResize = debounce(
        () => {
            chartInstance?.resize();
        },
        200,
        { leading: true },
    );
    useAppMainResize(debouncedResize);

    function initCharts() {
        if (!elRef.value) {
            return;
        }
        if (chartInstance) {
            const opt = chartInstance.getOption();
            chartInstance.dispose();
            chartInstance = echarts.init(elRef.value, theme.value);
            chartInstance.setOption(opt);
        } else {
            chartInstance = echarts.init(elRef.value, theme.value);
        }
    }

    async function setOptions(options: echarts.EChartsOption, clear = true) {
        if (!elRef.value) {
            return;
        }
        if (elRef.value.offsetHeight === 0) {
            await nextTick();
        }

        if (!chartInstance) {
            initCharts();
        }
        clear && chartInstance!.clear();
        chartInstance!.setOption(options);
    }

    tryOnUnmounted(() => {
        if (!chartInstance) return;
        chartInstance.dispose();
        chartInstance = undefined;
    });

    function getInstance(): echarts.ECharts {
        if (!chartInstance) {
            initCharts();
        }
        return chartInstance!;
    }

    return {
        getInstance,
        setOptions,
        resize: debouncedResize,
    };
}
