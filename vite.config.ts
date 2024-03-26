import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import ElementPlus from "unplugin-element-plus/vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(), vueJsx(), ElementPlus({})],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    server: {
        host: "0.0.0.0",
        port: 5173,
        proxy: {
            "^/api/.*": {
                target: "http://localhost:8080",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
});
