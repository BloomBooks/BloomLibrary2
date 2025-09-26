import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        globals: true, // don't have to define expect() and friends
        watch: false, // prevent agent from getting hung up in watch mode
        exclude: [
            "**/node_modules/**",
            "**/dist/**",
            "**/cypress/**",
            "**/.{idea,git,cache,output,temp}/**",
            "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
            "**/tests/**", // Exclude Playwright tests
            "**/test-results/**",
            "**/playwright-report/**",
        ],
    },
});
