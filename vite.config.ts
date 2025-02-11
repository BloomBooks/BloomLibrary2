import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import fs from "fs";
import path from "path";

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
            assetsDir: "static",
        },

        plugins: [
            removeNonpublishableFilesPlugin(),
            // if you import an svg file with this ?react at the end, it will be converted to a React component
            svgr({
                include: "**/*.svg?react",
            }),
            react(),
        ],
    };
});

// vite doesn't offer a way to exclude files in the public directory from being copied to the build directory.
// So we work around it by removing them after they are copied.
// See public/translations/README.md for why they must be in the public directory.
// I tried hard to make crowdin not download qaa-x-test but to no avail. I tried using the config file
// and even directly putting --exclude-language on the command line call.
function removeNonpublishableFilesPlugin(): Plugin {
    return {
        name: "remove-nonpublishable-files-plugin",
        writeBundle({ dir }) {
            const buildDir = dir || path.join(__dirname, "build");
            const pathsToRemove = [
                "translations/crowdin.yml",
                "translations/README.md",
                "translations/BloomLibrary.org",
                "translations/qaa-x-test",
            ];

            for (const relativePath of pathsToRemove) {
                const fullPath = path.join(buildDir, relativePath);
                if (fs.existsSync(fullPath)) {
                    fs.rmSync(fullPath, { recursive: true, force: true });
                }
            }
        },
    };
}
