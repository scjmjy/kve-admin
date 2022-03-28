declare global {
    namespace NodeJS {
        export interface ProcessEnv {
            NODE_ENV: "development" | "production";
        }
    }
}
export {};
