/// <reference types="vitest" />
import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import svgrPlugin from "vite-plugin-svgr";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    // This changes the out put dir from dist to build
    // comment this out if that isn't relevant for your project
    build: {
        outDir: "build",
    },
    test: {},
    plugins: [
        reactRefresh(),
        react({
            jsxImportSource: "@emotion/react",
        }),
        svgrPlugin({
            svgrOptions: {
                //icon: true,
                // ...svgr options (https://react-svgr.com/docs/options/)
            },
        }),
    ],
    define: {
        //"process.env": "import.meta.env",
        //"process.env.BABEL_TYPES_8_BREAKING": JSON.stringify([]),
        global: {},
    },
    esbuild: {
        logOverride: { "this-is-undefined-in-esm": "silent" }, //https://github.com/vitejs/vite/issues/8644
    },
});
