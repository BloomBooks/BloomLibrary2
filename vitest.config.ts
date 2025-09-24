import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        globals: true, // don't have to define expect() and friends
        watch: false, // prevent agent from getting hung up in watch mode
    },
});
