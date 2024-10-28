import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig(() => {
    return {
        server: {
            open: true,

            proxy: {
                // get past the CORS issue. getBloomApiUrl() detects we are running locally and uses "/api" so that we come here.
                "/api": {
                    target: "https://api.bloomlibrary.org",
                    changeOrigin: true,
                    secure: true,
                    rewrite: (path) => path.replace(/^\/api/, ""),
                },
                "/s3": {
                    target: "https://s3.amazonaws.com",
                    changeOrigin: true,
                    rewrite: (path) => {
                        return path.replace(/^\/s3/, "");
                    },
                },
            },
        },
        build: {
            outDir: "build",
        },

        plugins: [
            // if you import an svg file with this ?react at the end, it will be converted to a React component
            svgr({
                include: "**/*.svg?react",
            }),
            react(),
        ],
    };
});
