export async function loadBlorg(page) {
    // await page.goto("/", { waitUntil: "load" });
    await page.goto("http://localhost:3000/", { waitUntil: "load" });
} // TODO is this right?

export async function createPageAndLoadBlorg(browser) {
    const page = await browser.newPage();
    await loadBlorg(page);
    return page;
}

export async function clickLink(page, name, href) {
    await page.getByRole("link", { name }).locator(href).click();
}
