import { App } from "vue";
import CrudForm from "./CrudForm.vue";
import ReadonlySwitch from "./ReadonlySwitch.vue";
import MenuTypeRadio from "./MenuTypeRadio.vue";
import BasicSelect from "./BasicSelect.vue";
import GenderSelect from "./GenderSelect.vue";
import StatusSelect from "./StatusSelect.vue";
import BasicTreeSelect from "./BasicTreeSelect.vue";
import CrudFormDlg from "@/components/dialog/CrudFormDlg.vue";

export function setupCrudForm(app: App) {
    app.component(ReadonlySwitch.name, ReadonlySwitch);
    app.component(MenuTypeRadio.name, MenuTypeRadio);
    app.component(BasicSelect.name, BasicSelect);
    app.component(GenderSelect.name, GenderSelect);
    app.component(StatusSelect.name, StatusSelect);
    app.component(BasicTreeSelect.name, BasicTreeSelect);
    app.component(CrudForm.name, CrudForm);
    app.component(CrudFormDlg.name, CrudFormDlg);
}

import type { ElSwitch, ElRadioGroup } from "element-plus";

declare module "@vue/runtime-core" {
    export interface GlobalComponents {
        CrudForm: typeof CrudForm;
        BasicSelect: typeof BasicSelect;
        GenderSelect: typeof GenderSelect;
        StatusSelect: typeof StatusSelect;
        BasicTreeSelect: typeof BasicTreeSelect;
        CrudFormDlg: typeof CrudFormDlg;
        ReadonlySwitch: typeof ReadonlySwitch & typeof ElSwitch;
        MenuTypeRadio: typeof MenuTypeRadio & typeof ElRadioGroup;
    }
}
