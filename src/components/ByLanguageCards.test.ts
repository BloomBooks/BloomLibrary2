import { makeVirtualCollectionOfBooksInCollectionThatHaveLanguage } from "./ByLanguageCards";
import { ICollection } from "../model/ContentInterfaces";

const makeCollection = (
    filter: object | undefined,
    childCollections: ICollection[] = []
) =>
    (({
        filter,
        childCollections,
        urlKey: "test-collection",
        label: "Test Collection",
        layout: "by-language",
    } as unknown) as ICollection);

it("a language subset of a collection with no filters anywhere matches no books (BL-17086)", () => {
    const base = makeCollection(undefined, [makeCollection(undefined)]);
    const subset = makeVirtualCollectionOfBooksInCollectionThatHaveLanguage(
        base,
        "en"
    );
    // Not just { language: "en" }, which would be every English book in the library.
    expect(subset.filter).toEqual({ anyOfThese: [], language: "en" });
});

it("a language subset keeps the children's filters", () => {
    const base = makeCollection(undefined, [
        makeCollection({ otherTags: "bookshelf:first" }),
    ]);
    const subset = makeVirtualCollectionOfBooksInCollectionThatHaveLanguage(
        base,
        "en"
    );
    expect(subset.filter).toEqual({
        anyOfThese: [{ otherTags: "bookshelf:first" }],
        language: "en",
    });
});
