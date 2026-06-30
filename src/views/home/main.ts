import BaseLayout from "../layout/BaseLayout.vue";
import App from "./App.vue";
import { createRoot } from "@/utils";

createApp(App).component("BaseLayout", BaseLayout).mount(createRoot());
