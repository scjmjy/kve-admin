import { defineConfig, loadEnv } from "vite";
import path from "path";
import createVitePlugins from "./vite-plugins";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
    const cwd = process.cwd();
    const env = loadEnv(mode, cwd) as unknown as AdminDotEnv;
    // console.log("[VITE-CONFIG]", mode, cwd, env);
    return {
        base: env.VITE_PUBLIC_PATH,
        resolve: {
            alias: {
                "@": path.resolve(cwd, "src"),
            },
        },
        server: {
            https: true,
            host: true,
            port: +env.VITE_SERVER_PORT,
            proxy: {
                "/api": {
                    target: env.VITE_SERVER_PROXY,
                    changeOrigin: true,
                },
                "/static": {
                    target: env.VITE_SERVER_PROXY,
                    changeOrigin: false,
                },
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: "",
                },
            },
        },
        plugins: createVitePlugins(env, command === "build"),
    };
});
