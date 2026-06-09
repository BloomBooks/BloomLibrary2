import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { build as esbuild } from "esbuild";
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
            // Before we used vite, assets went into "static", so we're keeping it that way to minimize CD changes.
            assetsDir: "static",
        },

        plugins: [
            bundleBookNavigationInterceptorPlugin(), // For when Bloom Player needs to follow links in books
            serveTranslationsPlugin(),
            copyTranslationsPlugin(),
            // if you import an svg file with this ?react at the end, it will be converted to a React component
            svgr({
                include: "**/*.svg?react",
            }),
            react(),
        ],
    };
});

function bundleBookNavigationInterceptorPlugin(): Plugin {
    const serviceWorkerPath = "/book-navigation-interceptor-sw.js";
    const sourceFilePath = path.resolve(
        __dirname,
        "src/book-navigation-interceptor-sw.js"
    );

    return {
        name: "bundle-book-navigation-interceptor",
        configureServer(server) {
            // The book-navigation interceptor must be served from the site root so it can
            // register with scope "/" and intercept /book/... requests to make book navigation/links inside books work
            server.middlewares.use(
                serviceWorkerPath,
                async (_req, res, next) => {
                    try {
                        // During dev, bundle the worker to a single file so it keeps
                        // working as a classic service worker even though its source
                        // imports shared modules from src.
                        const bundledWorker = await bundleBookNavigationInterceptor(
                            sourceFilePath
                        );

                        res.setHeader("Content-Type", "application/javascript");
                        res.end(bundledWorker);
                    } catch (error) {
                        next(error as Error);
                    }
                }
            );
        },
        async writeBundle({ dir }) {
            const buildDir = dir || path.join(__dirname, "build");
            const bundledWorker = await bundleBookNavigationInterceptor(
                sourceFilePath
            );
            fs.writeFileSync(
                path.join(buildDir, "book-navigation-interceptor-sw.js"),
                bundledWorker
            );
        },
    };
}

async function bundleBookNavigationInterceptor(entryPoint: string) {
    const result = await esbuild({
        entryPoints: [entryPoint],
        bundle: true,
        format: "iife",
        platform: "browser",
        target: "es2020",
        write: false,
    });

    const outputFile = result.outputFiles?.[0];
    if (!outputFile) {
        throw new Error(
            "Failed to bundle book-navigation interceptor service worker"
        );
    }

    return outputFile.text;
}

// Copies translation files from src to build
function copyTranslationsPlugin(): Plugin {
    // BloomLibrary.org is where the source (English) files are. We don't need them in the build.
    // I tried hard to make crowdin not download qaa-x-test but to no avail. I tried using the config file
    // and even directly putting --exclude-language on the command line call.
    const excludedDirectories = ["BloomLibrary.org", "qaa-x-test"];

    return {
        name: "copy-translations-plugin",
        writeBundle({ dir }) {
            const buildDir = dir || path.join(__dirname, "build");
            const srcTranslationsDir = path.join(__dirname, "src/translations");
            const buildTranslationsDir = path.join(buildDir, "translations");

            fs.mkdirSync(buildTranslationsDir, { recursive: true });

            fs.readdirSync(srcTranslationsDir, { withFileTypes: true })
                .filter(
                    (entry) =>
                        // We don't want the files (README.md, etc.), only the language directories.
                        entry.isDirectory() &&
                        !excludedDirectories.includes(entry.name)
                )
                .forEach((language) => {
                    fs.cpSync(
                        path.join(srcTranslationsDir, language.name),
                        path.join(buildTranslationsDir, language.name),
                        { recursive: true }
                    );
                });
        },
    };
}

// Used to serve translation files when running `pnpm dev`
function serveTranslationsPlugin(): Plugin {
    return {
        name: "serve-translations",
        configureServer(server) {
            server.middlewares.use("/translations", (req, res, next) => {
                if (!req.url) {
                    next();
                    return;
                }

                // URL format: /translations/lang/BloomLibrary.org/file.json
                const parts = req.url.split("/");
                if (parts.length >= 4) {
                    const lang = parts[1];
                    const filename = parts[parts.length - 1];
                    const filePath = path.join(
                        __dirname,
                        "src/translations",
                        lang,
                        "BloomLibrary.org",
                        decodeURIComponent(filename)
                    );

                    if (fs.existsSync(filePath)) {
                        const content = fs.readFileSync(filePath, "utf8");
                        res.setHeader("Content-Type", "application/json");
                        res.end(content);
                        return;
                    } else {
                        console.error(
                            `Attempted to serve nonexistent translation file ${filePath}`
                        );
                    }
                }
                next();
            });
        },
    };
}
