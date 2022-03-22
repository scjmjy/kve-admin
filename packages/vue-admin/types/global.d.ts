interface AdminDotEnv {
    readonly VITE_SERVER_PROXY: string;
    readonly VITE_SERVER_PORT: string;
    readonly VITE_PUBLIC_PATH: string;
    readonly VITE_AXIOS_BASE_API: string;
    // 更多环境变量...
}
interface ImportMetaEnv extends AdminDotEnv {}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
