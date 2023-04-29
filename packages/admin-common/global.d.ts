declare global {
    export type Undefinable<T> = T | undefined;
    export type Nullable<T> = T | null;
    export type Arrayable<T> = T | T[];
    export type Awaitable<T> = Promise<T> | T;
}
export {};
