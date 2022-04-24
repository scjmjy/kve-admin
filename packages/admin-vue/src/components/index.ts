import type { App } from "vue";
import ElementPlus from "element-plus";
import type { ElAvatar } from "element-plus";
import locale_zhCn from "element-plus/lib/locale/lang/zh-cn";
import VueCropper from "vue-cropper";
import "vue-cropper/dist/index.css";
import { SvgiconPlugin } from "./svgicon";
import FileSelectButton from "./button/FileSelectButton.vue";
import ReadonlySwitch from "./switch/ReadonlySwitch.vue";
import StatusTag from "./tag/StatusTag.vue";
import UserAvatar from "./avatar/UserAvatar.vue";
import { setupCrudForm } from "./form";
import { setupCrudTable } from "./table";

declare module "element-plus/es/components/tree/src/tree.type" {
    interface TreeOptionProps {
        /**
         * ElementPlus 默认以 node.value 作为值，通过修改 value="_id"，则以 node._id 作为值
         */
        value?: string;
    }
}

export function setupComponents(app: App) {
    app.use(ElementPlus, {
        locale: locale_zhCn,
    });
    app.use(VueCropper);
    app.use(SvgiconPlugin);
    app.component(FileSelectButton.name, FileSelectButton);
    app.component(ReadonlySwitch.name, ReadonlySwitch);
    app.component(StatusTag.name, StatusTag);
    app.component(UserAvatar.name, UserAvatar);
    setupCrudForm(app);
    setupCrudTable(app);
}

import type SvgIcon from "./svgicon/SvgIcon.vue";
import type { ElButton, ElSwitch } from "element-plus";

declare module "@vue/runtime-core" {
    export interface GlobalComponents {
        SvgIcon: typeof SvgIcon;
        VueCropper: typeof VueCropper.VueCropper;
        StatusTag: typeof StatusTag;
        FileSelectButton: typeof FileSelectButton & typeof ElButton;
        UserAvatar: typeof UserAvatar & typeof ElAvatar;
        ReadonlySwitch: typeof ReadonlySwitch & typeof ElSwitch;
    }
}
