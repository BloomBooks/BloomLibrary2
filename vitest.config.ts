import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        globals: true, // don't have to define expect() and friends
        reporters: process.env.TEAMCITY_VERSION
            ? ["default", "vitest-teamcity-reporter"]
            : ["default"],
    },
});
