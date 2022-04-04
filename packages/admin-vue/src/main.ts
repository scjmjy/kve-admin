import { createApp } from "vue";
import { setupStore } from "@/store";
import { setupRouter } from "@/router";
import App from "@/App.vue";
import { setupComponents } from "./components";
import { setupDirectives } from "./directives";

const app = createApp(App);

setupRouter(app);

setupStore(app);

setupComponents(app);

setupDirectives(app);

app.mount("#app");
