import vue from "@vitejs/plugin-vue";

import createSvgIcon from "./plugin-svgicon";
import createSetup from "./plugin-setup";

export default function createVitePlugins(viteEnv: any, isBuild = false) {
    const vitePlugins = [vue(), createSvgIcon(isBuild), createSetup()];
    return vitePlugins;
}
