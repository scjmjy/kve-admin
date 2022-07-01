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
