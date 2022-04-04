import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

export default function createSvgIcon(isBuild: boolean) {
    return createSvgIconsPlugin({
        iconDirs: ["../src/assets/icons"],
        symbolId: "icon-[dir]-[name]",
        svgoOptions: isBuild,
    });
}
