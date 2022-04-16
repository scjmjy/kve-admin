declare module "mongoose" {
    export type PopulateQuery<T> = FilterQuery<T> & {
        doPopulate?: boolean;
    };
}
export {};
