import { test, expect } from "@playwright/test";

test.describe("Home Page Console Errors", () => {
    test("should load home page without console errors", async ({ page }) => {
        // Array to collect console errors
        const consoleErrors: string[] = [];
        const consoleWarnings: string[] = [];

        // Listen for console errors
        page.on("console", (msg) => {
            if (msg.type() === "error") {
                consoleErrors.push(`ERROR: ${msg.text()}`);
            } else if (msg.type() === "warning") {
                consoleWarnings.push(`WARNING: ${msg.text()}`);
            }
        });

        // Listen for page errors
        page.on("pageerror", (error) => {
            consoleErrors.push(`PAGE ERROR: ${error.message}`);
        });

        // Navigate to the home page
        await page.goto("/");

        // Wait for the page to start loading
        await page.waitForLoadState("domcontentloaded");

        // Give time for JavaScript to execute and catch any immediate errors
        await page.waitForTimeout(5000);

        // Try to wait for React to render - but don't fail if it doesn't
        try {
            await page.waitForSelector("body", { timeout: 5000 });
        } catch (e) {
            console.log(
                "Body selector timeout - page may not be loading properly"
            );
        }

        // Log captured console messages for debugging
        if (consoleErrors.length > 0) {
            console.log("Console Errors Found:");
            consoleErrors.forEach((error) => console.log(error));
        }

        if (consoleWarnings.length > 0) {
            console.log("Console Warnings Found:");
            consoleWarnings.forEach((warning) => console.log(warning));
        }

        // Filter out expected network errors in development environment
        const criticalErrors = consoleErrors.filter((error) => {
            // Ignore network errors for external services that may not be available in dev
            const isNetworkError =
                error.includes("Failed to load resource") &&
                error.includes("status of 400");
            const isParseServerError =
                error.includes("Error retrieving cleaned language list") &&
                error.includes("Request failed with status code 400");

            return !isNetworkError && !isParseServerError;
        });

        // Assert no critical console errors occurred
        expect(
            criticalErrors,
            `Found ${
                criticalErrors.length
            } critical console errors: ${criticalErrors.join(", ")}`
        ).toHaveLength(0);

        // Optionally, we can also check for warnings if desired
        // expect(consoleWarnings).toHaveLength(0);
    });

    test("should have a proper page title", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(2000);

        // Check that we have a meaningful title
        const title = await page.title();
        expect(title).toBeTruthy();
        console.log("Page title:", title);
    });
});
