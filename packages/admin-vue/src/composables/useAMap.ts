/// <reference types="@types/amap-js-api" />

import AMapLoader from "@amap/amap-jsapi-loader";
let $__loaded = false;

// TODO 按需加载 plugins / ui
export async function useAMap() {
    if ($__loaded) {
        return {
            AMap: window.AMap,
        };
    }
    return AMapLoader.load({
        key: "748c684c2bb1a67cec8a873a4b6d07e4",
        version: "1.4.15",
        // key: "62efc6c60c79af251197a3427b7e28e2",
        // version: "2",
        plugins: ["AMap.Scale", "AMap.ToolBar"],
        AMapUI: {
            version: "1.1",
        },
    }).then(() => {
        $__loaded = true;
        // console.log("[AMapLoader]", res);
        return {
            AMap: window.AMap,
        };
    });
}

export function isAMapLoaded() {
    return $__loaded;
}
