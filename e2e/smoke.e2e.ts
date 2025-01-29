import { test, expect, Page } from "@playwright/test";
import { createPageAndLoadBlorg } from "./e2eHelpers";
import { searchDeeper, searchForBook } from "./bookSearchHelpers";

let page: Page; // Reuse page object to save time; we only reload the language chooser when necessary

test.describe("has Bloom title", () => {
    test.beforeAll(async ({ browser }) => {
        page = await createPageAndLoadBlorg(browser);
    });

    test("has Bloom title", async () => {
        await expect(page).toHaveTitle(/Bloom/);
    });
});

test.describe("find moon and cap", () => {
    test.beforeAll(async ({ browser }) => {
        page = await createPageAndLoadBlorg(browser);
    });

    test("has Bloom title", async () => {
        const moonAndCapString = "moon and the cap";
        await searchForBook(page, moonAndCapString);
        // expect that there is a button which contains the text "The Moon and the Cap"
        await expect(
            page.locator(`button:has-text("${moonAndCapString}")`)
        ).toBeVisible();

        await searchDeeper(page);

        await expect(
            page.locator(`button:has-text("${moonAndCapString}")`)
        ).toBeVisible();
    });
});
