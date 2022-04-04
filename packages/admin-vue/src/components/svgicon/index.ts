import type { App, DefineComponent } from "vue";
import * as components from "@element-plus/icons-vue";
import SvgIcon from "./SvgIcon.vue";

export const appIcons: string[] = [];
export const elIcons: string[] = [];

const modules = import.meta.glob("../../assets/icons/*.svg");
for (const path in modules) {
    const p = path.split("assets/icons/")[1].split(".svg")[0];
    appIcons.push(p);
}

export const SvgiconPlugin = {
    install: (app: App) => {
        const icons = components as unknown as Record<string, DefineComponent<{}, {}, any>>;
        for (const key in icons) {
            const cfg = icons[key];
            app.component(cfg.name, cfg);
            elIcons.push(cfg.name);
        }
        app.component("SvgIcon", SvgIcon);
    },
};
