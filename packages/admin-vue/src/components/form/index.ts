import { App } from "vue";
import CrudForm from "./CrudForm.vue";
import ReadonlySwitch from "./ReadonlySwitch.vue";
import MenuTypeRadio from "./MenuTypeRadio.vue";
import PathInput from "./PathInput.vue";
import IconSelectInput from "./IconSelectInput.vue";
import BasicSelect from "./BasicSelect.vue";
import GenderSelect from "./GenderSelect.vue";
import StatusSelect from "./StatusSelect.vue";
import BasicTreeSelect from "./BasicTreeSelect.vue";
import BasicUpload from "./BasicUpload.vue";
import CrudFormDlg from "@/components/dialog/CrudFormDlg.vue";

export function setupCrudForm(app: App) {
    app.component(ReadonlySwitch.name, ReadonlySwitch);
    app.component(MenuTypeRadio.name, MenuTypeRadio);
    app.component(PathInput.name, PathInput);
    app.component(IconSelectInput.name, IconSelectInput);
    app.component(BasicSelect.name, BasicSelect);
    app.component(GenderSelect.name, GenderSelect);
    app.component(StatusSelect.name, StatusSelect);
    app.component(BasicTreeSelect.name, BasicTreeSelect);
    app.component(BasicUpload.name, BasicUpload);
    app.component(CrudForm.name, CrudForm);
    app.component(CrudFormDlg.name, CrudFormDlg);
}

import type { ElInput, ElSelect, ElTreeSelect, ElSwitch, ElRadioGroup, ElUpload } from "element-plus";

declare module "@vue/runtime-core" {
    export interface GlobalComponents {
        CrudForm: typeof CrudForm;
        PathInput: typeof PathInput & typeof ElInput;
        IconSelectInput: typeof IconSelectInput & typeof ElInput;
        BasicSelect: typeof BasicSelect & typeof ElSelect;
        GenderSelect: typeof GenderSelect & typeof ElSelect;
        StatusSelect: typeof StatusSelect & typeof ElSelect;
        BasicTreeSelect: typeof BasicTreeSelect & typeof ElTreeSelect;
        BasicUpload: typeof BasicUpload & Omit<typeof ElUpload, "action" | "accept" | "list-type">;
        CrudFormDlg: typeof CrudFormDlg;
        ReadonlySwitch: typeof ReadonlySwitch & typeof ElSwitch;
        MenuTypeRadio: typeof MenuTypeRadio & typeof ElRadioGroup;
    }
}
