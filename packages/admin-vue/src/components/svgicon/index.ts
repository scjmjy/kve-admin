import type { App, DefineComponent } from "vue";
import * as components from "@element-plus/icons-vue";
import SvgIcon from "./SvgIcon.vue";

export const appSpriteIcons: string[] = [];
export const elementPlusIcons: string[] = [];

const modules = import.meta.glob("/src/assets/icons/*.svg");
for (const path in modules) {
    const match = path.match(/icons\/(.*).svg$/);
    if (match && match.length) {
        appSpriteIcons.push("icon-" + match[1]);
    }
}

export const SvgiconPlugin = {
    install: (app: App) => {
        const icons = components as unknown as Record<string, DefineComponent<{}, {}, any>>;
        for (const key in icons) {
            const cfg = icons[key];
            app.component(cfg.name, cfg);
            elementPlusIcons.push(cfg.name);
        }
        app.component("SvgIcon", SvgIcon);
    },
};
