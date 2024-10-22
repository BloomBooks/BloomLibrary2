import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig(() => {
    return {
        server: {
            open: true,
        },
        build: {
            outDir: "build",
        },

        plugins: [
            //lingui(),
            react({
                // TODO: linguijs V4 will allow us to get rid of babel and use swc, using
                //plugins: [["@lingui/swc-plugin", {}]],
                // and then we can import the po files directly instead of having to compile js files
                babel: {
                    // makes lingui macros work. There is a some performance penalty, but I
                    //don't know how much. See https://github.com/skovhus/vite-lingui
                    plugins: ["macros"],
                    // I don't know why, but css props work without this or the 'macros' thing above
                    //   plugins: ["@emotion/babel-plugin"],
                },
                /* haven't tried this approach yet
                  jsxImportSource: '@emotion/react',
                    babel: {
                    plugins: ['@emotion/babel-plugin'],
                    },*/
            }),
            svgr(),
        ],
    };
});
