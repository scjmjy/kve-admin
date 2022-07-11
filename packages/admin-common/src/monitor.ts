import type log4js from "log4js";
import type { StatusCodes } from "http-status-codes";
import { LoginCredential } from "./user";
export interface CacheInfoItem {
    label: string;
    value: string;
}
export interface CacheInfoResult {
    items: CacheInfoItem[];
    columns: { label: string; prop: string }[];
    rows: Record<string, string | number>[];
}

export type DescItem = {
    label: string;
    value: string | number;
};

export type ChartItem =
    | {
          type: "pie";
          title: string;
          data: [string, number][];
      }
    | {
          type: "histogram";
          title: string;
          xAxis: string[];
          yAxis: string[];
          data: number[];
      };

export type MetricGroup = {
    title: string;
} & (
    | {
          type: "descriptions";
          items: DescItem[];
      }
    | {
          type: "charts";
          items: ChartItem[];
      }
);

export interface MetricTimelines {
    [timestamp: string]: MetricGroup[];
}

export interface LogData<ReqBody = any> {
    method: string;
    url: string;
    query: Record<string, any>;
    params: Record<string, any>;
    reqBody: ReqBody;
    status: StatusCodes;
    success: boolean;
    userId?: string;
    username?: string;
    ip: string;
    location?: string;
    /** unit: ms */
    elapsedTime: number;
}

export interface LogItem<DataT> extends Pick<log4js.LoggingEvent, "categoryName" | "startTime" | "level" | "cluster"> {
    INSTANCE: string; // NODE_APP_INSTANCE

    data: DataT;
}

export type AccessLogItem = LogItem<LogData<Omit<LoginCredential, "password">>>;
export type OperationLogItem = LogItem<LogData>;
export type DebugLogItem = LogItem<string>;

export const logCategories = ["debug", "access", "operation"] as const;
export type LogCategoryEnum = typeof logCategories[number];
// export interface LogFilter {
//     level?: string;
//     category?: LogCategoryEnum;
//     pageNum: number;
//     pageSize: number;
//     // startTime?: string;
//     // endTime?: string;
// }
// export type ReadLogItemsParams = LogFilter;
// export type ReadLogItemsResult = PaginationResult<LogItem>;
