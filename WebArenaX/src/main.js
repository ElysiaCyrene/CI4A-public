import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

// --- 添加这两行 ---
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
// ----------------

const app = createApp(App);

// --- 添加这一行 ---
app.use(Antd);
// ----------------

app.mount("#app");
