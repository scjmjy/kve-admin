<template>
    <div ref="refMap"></div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useECharts } from "@/composables/useEcharts";
import { request } from "@/api/request";

const refMap = ref<HTMLDivElement>();

const { echarts, echartPromise } = useECharts(refMap, { amap: true, delayDispose: 500 });

echartPromise.then(async (echartInstance) => {
    const res = await request({
        method: "GET",
        url: "/static/geo/bus-lines.json",
    });
    if (!res.data) {
        return;
    }

    const busLines: number[][] = res.data;

    let hStep = 300 / (busLines.length - 1);
    const busLinesData = busLines.map(function (busLine, idx) {
        let prevPt: number[] = [];
        let points: number[][] = [];
        for (let i = 0; i < busLine.length; i += 2) {
            let pt = [busLine[i], busLine[i + 1]];
            if (i > 0) {
                pt = [prevPt[0] + pt[0], prevPt[1] + pt[1]];
            }
            prevPt = pt;
            points.push([pt[0] / 1e4, pt[1] / 1e4]);
        }
        return {
            coords: points,
            lineStyle: {
                color: echarts.color.modifyHSL("#5A94DF", Math.round(hStep * idx)),
            },
        };
    });

    function getMapStyle(dark: boolean) {
        return dark ? "amap://styles/blue" : "amap://styles/normal";
    }

    echartInstance.setOption((dark, oldOpt) => {
        if (oldOpt) {
            // return oldOpt; // TODO 有必要的话，可以复用
        }
        const opt: echarts.EChartsOption = {
            backgroundColor: "transparent",
            title: {
                text: "Echarts-高德地图|公交路线图 示例",
                subtext: "啦啦啦啦啦啦",
                left: "center",
                textStyle: {
                    // color: "#fff",
                },
            },
            tooltip: {
                trigger: "item",
                formatter: "{b}",
            },
            legend: {
                orient: "vertical",
                left: "left",
                data: ["北京 Top10", "上海 Top10", "广州 Top10", "PM2.5", "PM2.5 TOP5"],
                selectedMode: "single",
                textStyle: {
                    color: "#fff",
                },
            },
            xAxis: {
                show: false,
            },
            yAxis: {
                show: false,
            },
            amap: {
                center: [116.46, 39.92],
                zoom: 10,
                mapStyle: getMapStyle(dark),
            },
            series: [
                {
                    type: "lines",
                    coordinateSystem: "amap",
                    polyline: true,
                    data: busLinesData,
                    silent: true,
                    lineStyle: {
                        opacity: 0.2,
                        width: 1,
                    },
                    progressiveThreshold: 500,
                    progressive: 200,
                },
                {
                    type: "lines",
                    coordinateSystem: "amap",
                    polyline: true,
                    data: busLinesData,
                    lineStyle: {
                        width: 0,
                    },
                    effect: {
                        constantSpeed: 20,
                        show: true,
                        trailLength: 0.1,
                        symbolSize: 1.5,
                    },
                    zlevel: 1,
                },
            ],
        };
        return opt;
    });
});
</script>

<style scoped></style>
