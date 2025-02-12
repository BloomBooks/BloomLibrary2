import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        globals: true, // don't have to define expect() and friends
        reporters:
            process.env.CI === "true"
                ? ["vitest-teamcity-reporter"]
                : ["default"],
    },
});
