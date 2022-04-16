import "vue-router";
declare module "vue-router" {
    interface RouteMeta {
        /**
         * 在 AppMenu 和 TabList 中显示的名称
         */
        title?: string;
        /**
         * 此参数只在 visible=true 时有意义
         *
         * 在 AppMenu 中 title 前面显示的图标
         */
        icon?: string;
        /**
         * true: 固定在 TabList 最开头
         *
         * @default false
         */
        pinned?: boolean; // true: 默认为 false
        /**
         * true: 可以被 keep-alive 缓存
         *
         * false: 不被缓存，此时 route.name 和 VueComponent.name 的值就没有多大意义了。
         *
         * @default true
         */
        cacheable?: boolean;
        /**
         * true: 在 AppMenu 中显示
         *
         * false: 不在 AppMenu 中显示
         *
         * @default true
         */
        visible?: boolean;
        /**
         * 此参数只在 visible=false 时有意义
         *
         * 当此页面被激活后，高亮 AppMenu 里名为 ${forName} 的 Route
         *
         * 使用场景：适用于详情页，本身不在 AppMenu 中，所以当激活时，高亮对应的列表页面
         */
        forName?: string;
        /**
         * 此参数只在 cacheable=true 时有意义
         *
         * fullPath:
         * 1. 使用 route.fullPath 来区分是否是同一个页面
         * 2. /user/detail?id=1 和 /user/detail?id=2 会被认为 ***不同*** 的页面，可以同时存在
         * 3. 使用场景：同时存在多个详情页
         *
         * path:
         * 1. 使用 route.path 来区分
         * 2. /user/detail?id=1 和 /user/detail?id=2 会被认为 ***相同*** 的页面，只会存在一个
         * 3. 使用场景：同时只存在一个详情页
         *
         * @default "path"
         */
        pathKey?: "path" | "fullPath";
        /**
         * 此参数只在外部链接时有效
         * 
         * iframe="http://xxxxx" 或 "https://xxxxx"： 嵌入到 iframe 中显示外部链接
         * 
         * @default undefined
         */
        iframe?: string;
    }
}
