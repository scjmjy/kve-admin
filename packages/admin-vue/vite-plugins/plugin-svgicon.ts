import path from "path";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

export default function createSvgIcon(isBuild: boolean) {
    const icondir = path.resolve(process.cwd(), "src/assets/icons");
    console.log("icondir", icondir);

    return createSvgIconsPlugin({
        iconDirs: [icondir],
        symbolId: "icon-[dir]-[name]",
        svgoOptions: isBuild,
    });
}
