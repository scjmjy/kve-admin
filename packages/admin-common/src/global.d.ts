type Projection<Doc> = (keyof Doc)[];

type Undefinable<T> = T | undefined;
type Nullable<T> = T | null;
type Arrayable<T> = T | T[];
type Awaitable<T> = Promise<T> | T;

type EnableStatus = typeof StatusEnum[number];

interface GridFsFile {
    /** 文件名称 */
    name: string;
    /**
     * 可以直接访问的地址，有以下 2 种类型：
     *
     * 1. /api/download/:objId
     * 2. 当内联时，url 为 base64 格式的数据：data:xxx/xxx;base64,....
     */
    url: string;
    size: number;
    mimetype: string;
}

interface CreateResult {
    _id: string;
}

type PaginationCondition = PaginationCondition1 | PaginationCondition2 | PaginationCondition3;

interface PaginationCondition1 {
    comparison: "eq" | "ne" | "gte" | "gt" | "lte" | "lt";
    value: string | number;
}
interface PaginationCondition2 {
    comparison: "range" | "in" | "nin";
    value: string[] | number[];
}
interface PaginationCondition3 {
    comparison: "regex";
    value: string;
}

type PaginationFilter<T extends string> = {
    [field in T]?: PaginationCondition;
};

type PaginationSort<T extends string> = {
    [field in T]: "ascending" | "descending";
};
interface PaginationParams<T extends string> {
    pageNum: number;
    pageSize: number;
    filter?: PaginationFilter<T>;
    sort?: PaginationSort<T>;
}

interface PaginationResult<T> {
    list: T[];
    total: number;
    pageNum: number;
    pageSize: number;
    pageTotal: number;
    pageStart: number;
    pagePre: number;
    pageNext: number;
    pageHasPre: boolean;
    pageHasNext: boolean;
}

interface DragDropBody {
    draggingId: string;
    draggingParentId: string;
    dropId: string;
    dropParentId: string;
    type: "before" | "after" | "inner";
    returnNew?: boolean;
}
