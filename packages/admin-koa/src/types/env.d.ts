declare global {
    namespace NodeJS {
        export interface ProcessEnv {
            NODE_ENV: "development" | "production";
            NODE_APP_INSTANCE: number;
        }
    }
}
export {};
