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

declare type Fn<T = any, R = any> = (...arg: T[]) => R;

declare type NoopFn = () => void;

declare module "*.svg";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.bmp";
declare module "*.tiff";
