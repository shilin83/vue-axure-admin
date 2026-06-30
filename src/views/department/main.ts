import BaseLayout from "../layout/BaseLayout.vue";
import App from "./App.vue";
import vPerm from "@/directives";
import { createRoot } from "@/utils";

createApp(App).component("BaseLayout", BaseLayout).directive("perm", vPerm).mount(createRoot());
