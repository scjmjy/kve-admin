import { App } from "vue";
import CrudForm from "./CrudForm.vue";
import BasicSelect from "./BasicSelect.vue";
import CrudFormDlg from "@/components/dialog/CrudFormDlg.vue";

export function setupCrudForm(app: App) {
    app.component(BasicSelect.name, BasicSelect);
    app.component(CrudForm.name, CrudForm);
    app.component(CrudFormDlg.name, CrudFormDlg);
}
// declare module "@vue/runtime-core" {
//     export interface GlobalComponents {
//         CrudForm: typeof CrudForm;
//         BasicSelect: typeof BasicSelect;
//     }
// }
