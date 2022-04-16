import { createApp } from "vue";
import { setupStore } from "@/store";
import { setupRouter } from "@/router";
import { setupComponents } from "@/components";
import { setupDirectives } from "@/directives";
import App from "@/App.vue";

import "virtual:svg-icons-register";

const app = createApp(App);

setupRouter(app);

setupStore(app);

setupComponents(app);

setupDirectives(app);

app.mount("#app");
