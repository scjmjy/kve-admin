interface AdminDotEnv {
    readonly VITE_SERVER_PORT: string;
    readonly VITE_PUBLIC_PATH: string;
    // 更多环境变量...
}
interface ImportMetaEnv extends AdminDotEnv {}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
