import { router } from "./router/index";
import { store } from "@/store";
import { createApp } from "vue";
import ElementPlus from "element-plus";
import App from "./App.vue";

// const x = import.meta.env.DEV_SERVER_PORT;

createApp(App).use(store).use(router).use(ElementPlus).mount("#app");
