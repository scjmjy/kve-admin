import type { App } from "vue";
import ElementPlus from "element-plus";
import locale_zhCn from "element-plus/lib/locale/lang/zh-cn";
import VueCropper from "vue-cropper";
import "vue-cropper/dist/index.css";
import { SvgiconPlugin } from "@/components/svgicon";
import FileSelectButton from "@/components/button/FileSelectButton.vue";
import ReadonlySwitch from "@/components/switch/ReadonlySwitch.vue";
import { setupCrudForm } from "./form";

export function setupComponents(app: App) {
    app.use(ElementPlus, {
        locale: locale_zhCn,
    });
    app.use(VueCropper);
    app.use(SvgiconPlugin);
    app.component("FileSelectButton", FileSelectButton);
    app.component("ReadonlySwitch", ReadonlySwitch);
    setupCrudForm(app);
}

import type { ElButton, ElSwitch } from "element-plus";
import type SvgIcon from "@/components/svgicon/SvgIcon.vue";
import CrudFormDlg from "@/components/dialog/CrudFormDlg.vue";
import CrudForm from "@/components/form/CrudForm.vue";

declare module "@vue/runtime-core" {
    export interface GlobalComponents {
        SvgIcon: typeof SvgIcon;
        VueCropper: typeof VueCropper;
        FileSelectButton: typeof FileSelectButton & typeof ElButton;
        ReadonlySwitch: typeof ReadonlySwitch & typeof ElSwitch;
        CrudFormDlg: typeof CrudFormDlg;
        CrudForm: typeof CrudForm;
    }
}
