import { router } from "./router";
import { store } from "@/store";
import { createApp } from "vue";
import ElementPlus from "element-plus";
import App from "./App.vue";

// const x = import.meta.env.DEV_SERVER_PORT;
const app = createApp(App);
// app.config.errorHandler = (err, vm, info) => {
//     console.log("errorHandler err", err);
//     console.log("errorHandler info", info);
// };
app.use(store).use(router).use(ElementPlus).mount("#app");

// Object.defineProperty(XMLHttpRequest.prototype, "onerror", {
//     writable: true,
//     configurable: true,
//     value: function (e: any) {
//         console.log("[XMLHttpRequest.prototype.onerror]", e);
//     },
// });
// XMLHttpRequest.prototype.onerror = function (e) {
//     console.log("[XMLHttpRequest.prototype.onerror]", e);
// };

// Object.defineProperty(HTMLImageElement.prototype, "onerror", {
//     writable: true,
//     configurable: true,
//     value: function (e: any) {
//         console.log("[HTMLImageElement]", e);
//     },
// });
