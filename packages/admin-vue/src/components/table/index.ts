import { App } from "vue";
import CrudTable from "./CrudTable.vue";

export function setupCrudTable(app: App) {
    app.component(CrudTable.name, CrudTable);
}

declare module "@vue/runtime-core" {
    export interface GlobalComponents {
        CrudTable: typeof CrudTable;
    }
}
