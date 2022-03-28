import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const cwd = process.cwd();
    const env = loadEnv(mode, cwd) as unknown as AdminDotEnv;
    // console.log("[VITE-CONFIG]", mode, cwd, env);
    return {
        resolve: {
            alias: {
                "@": path.resolve(cwd, "src"),
            },
        },
        server: {
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
        plugins: [vue()],
    };
});
