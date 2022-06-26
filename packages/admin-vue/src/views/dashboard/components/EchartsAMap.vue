<template>
    <div ref="refMap"></div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useECharts } from "@/composables/useEcharts";
import { geoCoordMap_cities } from "./geo-cities";

type CityName = keyof typeof geoCoordMap_cities;

interface PM25DataItemType {
    name: CityName;
    value: number;
}

const data_pm25: PM25DataItemType[] = [
    { name: "海门", value: 9 },
    { name: "鄂尔多斯", value: 12 },
    { name: "招远", value: 12 },
    { name: "舟山", value: 12 },
    { name: "齐齐哈尔", value: 14 },
    { name: "盐城", value: 15 },
    { name: "赤峰", value: 16 },
    { name: "青岛", value: 18 },
    { name: "乳山", value: 18 },
    { name: "金昌", value: 19 },
    { name: "泉州", value: 21 },
    { name: "莱西", value: 21 },
    { name: "日照", value: 21 },
    { name: "胶南", value: 22 },
    { name: "南通", value: 23 },
    { name: "拉萨", value: 24 },
    { name: "云浮", value: 24 },
    { name: "梅州", value: 25 },
    { name: "文登", value: 25 },
    { name: "上海", value: 25 },
    { name: "攀枝花", value: 25 },
    { name: "威海", value: 25 },
    { name: "承德", value: 25 },
    { name: "厦门", value: 26 },
    { name: "汕尾", value: 26 },
    { name: "潮州", value: 26 },
    { name: "丹东", value: 27 },
    { name: "太仓", value: 27 },
    { name: "曲靖", value: 27 },
    { name: "烟台", value: 28 },
    { name: "福州", value: 29 },
    { name: "瓦房店", value: 30 },
    { name: "即墨", value: 30 },
    { name: "抚顺", value: 31 },
    { name: "玉溪", value: 31 },
    { name: "张家口", value: 31 },
    { name: "阳泉", value: 31 },
    { name: "莱州", value: 32 },
    { name: "湖州", value: 32 },
    { name: "汕头", value: 32 },
    { name: "昆山", value: 33 },
    { name: "宁波", value: 33 },
    { name: "湛江", value: 33 },
    { name: "揭阳", value: 34 },
    { name: "荣成", value: 34 },
    { name: "连云港", value: 35 },
    { name: "葫芦岛", value: 35 },
    { name: "常熟", value: 36 },
    { name: "东莞", value: 36 },
    { name: "河源", value: 36 },
    { name: "淮安", value: 36 },
    { name: "泰州", value: 36 },
    { name: "南宁", value: 37 },
    { name: "营口", value: 37 },
    { name: "惠州", value: 37 },
    { name: "江阴", value: 37 },
    { name: "蓬莱", value: 37 },
    { name: "韶关", value: 38 },
    { name: "嘉峪关", value: 38 },
    { name: "广州", value: 38 },
    { name: "延安", value: 38 },
    { name: "太原", value: 39 },
    { name: "清远", value: 39 },
    { name: "中山", value: 39 },
    { name: "昆明", value: 39 },
    { name: "寿光", value: 40 },
    { name: "盘锦", value: 40 },
    { name: "长治", value: 41 },
    { name: "深圳", value: 41 },
    { name: "珠海", value: 42 },
    { name: "宿迁", value: 43 },
    { name: "咸阳", value: 43 },
    { name: "铜川", value: 44 },
    { name: "平度", value: 44 },
    { name: "佛山", value: 44 },
    { name: "海口", value: 44 },
    { name: "江门", value: 45 },
    { name: "章丘", value: 45 },
    { name: "肇庆", value: 46 },
    { name: "大连", value: 47 },
    { name: "临汾", value: 47 },
    { name: "吴江", value: 47 },
    { name: "石嘴山", value: 49 },
    { name: "沈阳", value: 50 },
    { name: "苏州", value: 50 },
    { name: "茂名", value: 50 },
    { name: "嘉兴", value: 51 },
    { name: "长春", value: 51 },
    { name: "胶州", value: 52 },
    { name: "银川", value: 52 },
    { name: "张家港", value: 52 },
    { name: "三门峡", value: 53 },
    { name: "锦州", value: 54 },
    { name: "南昌", value: 54 },
    { name: "柳州", value: 54 },
    { name: "三亚", value: 54 },
    { name: "自贡", value: 56 },
    { name: "吉林", value: 56 },
    { name: "阳江", value: 57 },
    { name: "泸州", value: 57 },
    { name: "西宁", value: 57 },
    { name: "宜宾", value: 58 },
    { name: "呼和浩特", value: 58 },
    { name: "成都", value: 58 },
    { name: "大同", value: 58 },
    { name: "镇江", value: 59 },
    { name: "桂林", value: 59 },
    { name: "张家界", value: 59 },
    { name: "宜兴", value: 59 },
    { name: "北海", value: 60 },
    { name: "西安", value: 61 },
    { name: "金坛", value: 62 },
    { name: "东营", value: 62 },
    { name: "牡丹江", value: 63 },
    { name: "遵义", value: 63 },
    { name: "绍兴", value: 63 },
    { name: "扬州", value: 64 },
    { name: "常州", value: 64 },
    { name: "潍坊", value: 65 },
    { name: "重庆", value: 66 },
    { name: "台州", value: 67 },
    { name: "南京", value: 67 },
    { name: "滨州", value: 70 },
    { name: "贵阳", value: 71 },
    { name: "无锡", value: 71 },
    { name: "本溪", value: 71 },
    { name: "克拉玛依", value: 72 },
    { name: "渭南", value: 72 },
    { name: "马鞍山", value: 72 },
    { name: "宝鸡", value: 72 },
    { name: "焦作", value: 75 },
    { name: "句容", value: 75 },
    { name: "北京", value: 79 },
    { name: "徐州", value: 79 },
    { name: "衡水", value: 80 },
    { name: "包头", value: 80 },
    { name: "绵阳", value: 80 },
    { name: "乌鲁木齐", value: 84 },
    { name: "枣庄", value: 84 },
    { name: "杭州", value: 84 },
    { name: "淄博", value: 85 },
    { name: "鞍山", value: 86 },
    { name: "溧阳", value: 86 },
    { name: "库尔勒", value: 86 },
    { name: "安阳", value: 90 },
    { name: "开封", value: 90 },
    { name: "济南", value: 92 },
    { name: "德阳", value: 93 },
    { name: "温州", value: 95 },
    { name: "九江", value: 96 },
    { name: "邯郸", value: 98 },
    { name: "临安", value: 99 },
    { name: "兰州", value: 99 },
    { name: "沧州", value: 100 },
    { name: "临沂", value: 103 },
    { name: "南充", value: 104 },
    { name: "天津", value: 105 },
    { name: "富阳", value: 106 },
    { name: "泰安", value: 112 },
    { name: "诸暨", value: 112 },
    { name: "郑州", value: 113 },
    { name: "哈尔滨", value: 114 },
    { name: "聊城", value: 116 },
    { name: "芜湖", value: 117 },
    { name: "唐山", value: 119 },
    { name: "平顶山", value: 119 },
    { name: "邢台", value: 119 },
    { name: "德州", value: 120 },
    { name: "济宁", value: 120 },
    { name: "荆州", value: 127 },
    { name: "宜昌", value: 130 },
    { name: "义乌", value: 132 },
    { name: "丽水", value: 133 },
    { name: "洛阳", value: 134 },
    { name: "秦皇岛", value: 136 },
    { name: "株洲", value: 143 },
    { name: "石家庄", value: 147 },
    { name: "莱芜", value: 148 },
    { name: "常德", value: 152 },
    { name: "保定", value: 153 },
    { name: "湘潭", value: 154 },
    { name: "金华", value: 157 },
    { name: "岳阳", value: 169 },
    { name: "长沙", value: 175 },
    { name: "衢州", value: 177 },
    { name: "廊坊", value: 193 },
    { name: "菏泽", value: 194 },
    { name: "合肥", value: 229 },
    { name: "武汉", value: 273 },
    { name: "大庆", value: 279 },
];

function convertData_scatter(data: PM25DataItemType[]) {
    const res = [];
    for (let i = 0; i < data.length; i++) {
        const geoCoord = geoCoordMap_cities[data[i].name];
        if (geoCoord) {
            res.push({
                name: data[i].name,
                value: geoCoord.concat(data[i].value),
            });
        }
    }
    return res;
}

type TrafficPM25DataItemType = [
    {
        name: CityName;
    },
    { name: CityName; value: number },
];

const data_traffic_BJ: TrafficPM25DataItemType[] = [
    [{ name: "北京" }, { name: "上海", value: 95 }],
    [{ name: "北京" }, { name: "广州", value: 90 }],
    [{ name: "北京" }, { name: "大连", value: 80 }],
    [{ name: "北京" }, { name: "南宁", value: 70 }],
    [{ name: "北京" }, { name: "南昌", value: 60 }],
    [{ name: "北京" }, { name: "拉萨", value: 50 }],
    [{ name: "北京" }, { name: "长春", value: 40 }],
    [{ name: "北京" }, { name: "包头", value: 30 }],
    [{ name: "北京" }, { name: "重庆", value: 20 }],
    [{ name: "北京" }, { name: "常州", value: 10 }],
];
const data_traffic_SH: TrafficPM25DataItemType[] = [
    [{ name: "上海" }, { name: "包头", value: 95 }],
    [{ name: "上海" }, { name: "昆明", value: 90 }],
    [{ name: "上海" }, { name: "广州", value: 80 }],
    [{ name: "上海" }, { name: "郑州", value: 70 }],
    [{ name: "上海" }, { name: "长春", value: 60 }],
    [{ name: "上海" }, { name: "重庆", value: 50 }],
    [{ name: "上海" }, { name: "长沙", value: 40 }],
    [{ name: "上海" }, { name: "北京", value: 30 }],
    [{ name: "上海" }, { name: "丹东", value: 20 }],
    [{ name: "上海" }, { name: "大连", value: 10 }],
];
const data_traffic_GZ: TrafficPM25DataItemType[] = [
    [{ name: "广州" }, { name: "福州", value: 95 }],
    [{ name: "广州" }, { name: "太原", value: 90 }],
    [{ name: "广州" }, { name: "长春", value: 80 }],
    [{ name: "广州" }, { name: "重庆", value: 70 }],
    [{ name: "广州" }, { name: "西安", value: 60 }],
    [{ name: "广州" }, { name: "成都", value: 50 }],
    [{ name: "广州" }, { name: "常州", value: 40 }],
    [{ name: "广州" }, { name: "北京", value: 30 }],
    [{ name: "广州" }, { name: "北海", value: 20 }],
    [{ name: "广州" }, { name: "海口", value: 10 }],
];
function convertData_lines(data: TrafficPM25DataItemType[]) {
    const res = [];
    for (let i = 0; i < data.length; i++) {
        const dataItem = data[i];
        const fromCoord = geoCoordMap_cities[dataItem[0].name];
        const toCoord = geoCoordMap_cities[dataItem[1].name];
        if (fromCoord && toCoord) {
            res.push({
                fromName: dataItem[0].name,
                toName: dataItem[1].name,
                coords: [fromCoord, toCoord],
            });
        }
    }
    return res;
}

const refMap = ref<HTMLDivElement>();

const { echarts, echartPromise } = useECharts(refMap, true);

echartPromise.then(async (echartInstance) => {
    const color = ["#a6c84c", "#ffa022", "#46bee9"];
    const planePath =
        "path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z";
    const flyLineSeries: echarts.EChartsOption["series"][] = [];
    [
        ["北京", data_traffic_BJ],
        ["上海", data_traffic_SH],
        ["广州", data_traffic_GZ],
    ].forEach((item, index) => {
        flyLineSeries.push(
            {
                name: item[0] + " Top10",
                type: "lines",
                coordinateSystem: "amap",
                zlevel: 1,
                effect: {
                    show: true,
                    period: 6,
                    trailLength: 0.7,
                    color: color[index],
                    symbolSize: 3,
                },
                lineStyle: {
                    color: color[index],
                    width: 1,
                    opacity: 0.6,
                    curveness: 0.2,
                    type: "dotted",
                },
                data: convertData_lines(item[1] as TrafficPM25DataItemType[]),
            },
            {
                name: item[0] + " Top10",
                type: "lines",
                coordinateSystem: "amap",
                zlevel: 2,
                symbol: ["none", "arrow"],
                symbolSize: 10,
                effect: {
                    show: true,
                    period: 6,
                    trailLength: 0,
                    symbol: planePath,
                    symbolSize: 15,
                    color: color[index],
                },
                lineStyle: {
                    color: color[index],
                    width: 1,
                    opacity: 0.6,
                    curveness: 0.2,
                    type: "dotted",
                },
                data: convertData_lines(item[1] as TrafficPM25DataItemType[]),
            },
            {
                name: item[0] + " Top10",
                type: "effectScatter",
                coordinateSystem: "amap",
                effectType: "ripple",
                zlevel: 2,
                rippleEffect: {
                    brushType: "stroke",
                },
                label: {
                    show: true,
                    position: "right",
                    formatter: "{b}",
                },
                symbolSize: function (val) {
                    return val[2] / 8;
                },
                itemStyle: {
                    color: color[index],
                },
                data: (item[1] as TrafficPM25DataItemType[]).map(function (dataItem) {
                    return {
                        name: dataItem[1].name,
                        value: geoCoordMap_cities[dataItem[1].name].concat([dataItem[1].value]),
                    };
                }),
            },
        );
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
                text: "Echarts-高德地图|散点图|飞线图 示例",
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
            dataRange: {
                min: 0,
                max: 100,
                calculable: true,
                color: ["#ff3333", "orange", "yellow", "lime", "aqua"],
                textStyle: {
                    color: "#fff",
                },
            },
            // geo: {
            //     id: "geo-china",
            //     map: "china",
            //     roam: true,
            //     itemStyle: {
            //         areaColor: "grey",
            //     },
            // },
            xAxis: {
                show: false,
            },
            yAxis: {
                show: false,
            },
            amap: {
                // center: [116.46, 39.92],
                zoom: 4,
                mapStyle: getMapStyle(dark),
            },
            series: [
                ...(flyLineSeries as any),
                {
                    name: "PM2.5",
                    type: "scatter",
                    coordinateSystem: "amap",
                    data: convertData_scatter(data_pm25),
                    encode: {
                        value: 2,
                    },
                    symbolSize: function (val) {
                        return val[2] / 10;
                    },
                    label: {
                        formatter: "{b}",
                        position: "right",
                    },
                    itemStyle: {
                        // color: "#ddb926",
                    },
                    emphasis: {
                        label: {
                            show: true,
                        },
                    },
                },
                {
                    name: "PM2.5 TOP5",
                    type: "effectScatter",
                    coordinateSystem: "amap",
                    data: convertData_scatter(
                        data_pm25
                            .sort(function (a, b) {
                                return b.value - a.value;
                            })
                            .slice(0, 5),
                    ),
                    encode: {
                        value: 2,
                    },
                    symbolSize: function (val) {
                        return val[2] / 10;
                    },
                    // showEffectOn: "emphasis",
                    rippleEffect: {
                        brushType: "stroke",
                    },
                    // hoverAnimation: true,
                    label: {
                        formatter: "{b}",
                        position: "right",
                        show: true,
                    },
                    itemStyle: {
                        color: "#f4e925",
                        shadowBlur: 10,
                        shadowColor: "#333",
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
