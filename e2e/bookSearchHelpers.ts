export async function searchForBook(page, searchString) {
    await page.getByLabel("cancel search").click();
    const searchInput = await page.getByPlaceholder("search for books");
    await searchInput.click();
    await searchInput.fill(searchString);
    await searchInput.press("Enter");
}

export async function searchDeeper(page) {
    await page.getByRole("button", { name: "Search Deeper" }).click();
}
