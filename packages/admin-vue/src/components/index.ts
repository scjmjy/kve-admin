import type { App } from "vue";
import ElementPlus from "element-plus";
import { SvgiconPlugin } from "@/components/svgicon";

export function setupComponents(app: App) {
    app.use(ElementPlus);
    app.use(SvgiconPlugin);
}
