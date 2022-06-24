import { AxiosPromise } from "axios";

export type RequestApi<FilterT extends string, DataT> = (
    params: PaginationParams<FilterT>,
) => AxiosPromise<PaginationResult<DataT>>;

export type PostHandler<DataT> = (list: DataT[]) => void;

export class PageController<FilterT extends string, DataT> implements PaginationResult<DataT> {
    public list: DataT[] = [];
    public total = 0;
    public pageNum = 1;
    public pageTotal = 0;
    public pageStart = 0;
    public pagePre = 0;
    public pageNext = 0;
    public pageHasPre = false;
    public pageHasNext = false;
    constructor(
        public requestApi: RequestApi<FilterT, DataT>,
        public postHandler?: PostHandler<DataT>,
        public filter?: PaginationParams<FilterT>["filter"],
        public sort?: PaginationParams<FilterT>["sort"],
        public pageSize = 10,
    ) {}

    async navigateTo(pageNum?: number) {
        const res = await this.requestApi({
            pageNum: pageNum || this.pageNum,
            pageSize: this.pageSize,
            filter: this.filter,
            sort: this.sort,
        });
        Object.assign(this, res.data);
        this.postHandler && this.postHandler(this.list);
    }
}
