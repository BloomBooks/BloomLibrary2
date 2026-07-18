import {
    Book,
    createBookFromParseServerData,
    extractedTagPrefixes,
} from "./Book";

let cases: string[][][] = [
    [["quiz"]],
    [["quiz", "other"]],
    [["other", "quiz"]],
    [["quiz", "activity"]],
    [["quiz", "activity", "other"]],
    [["quiz", "other", "activity"]],
    [["other", "quiz", "activity"]],
];
test.each(cases)(
    "sanitizeFeaturesArray, if given quiz, adds activity if necessary",
    (features) => {
        expect(features).not.toBeUndefined();

        Book.sanitizeFeaturesArray(features);

        expect(features.filter((f) => f === "activity").length).toBe(1);
        expect(features.includes("quiz")).toBeTruthy();
    }
);

cases = [
    [[]],
    [["other"]],
    [["activity"]],
    [["activity", "other"]],
    [["other", "activity"]],
];
test.each(cases)(
    "sanitizeFeaturesArray leaves well enough alone",
    (features) => {
        expect(features).not.toBeUndefined();

        const original = features.slice();

        Book.sanitizeFeaturesArray(features);

        expect(features).toEqual(original);
    }
);

// Round-trip invariant for the extracted-tag seam (see the extractedTagPrefixes
// note in Book.ts). Every prefix that updateTagsFromParseServerData() strips out
// of book.tags on load MUST be put back by getTagsForSaving(), so loading server
// data and immediately preparing it for saving does not silently drop any tag.
// These tests parameterize over extractedTagPrefixes, so a newly added prefix is
// covered automatically: strip a prefix without re-merging it and this goes red.
describe("extracted-tag round trip (getTagsForSaving)", () => {
    const ordinaryTags = ["topic:Math", "system:Incoming"];

    test("re-merges every extracted prefix losslessly, alongside ordinary tags", () => {
        // One representative tag of each extracted kind, e.g. "level:1".
        const extractedTags = extractedTagPrefixes.map(
            (prefix, i) => `${prefix}${i + 1}`
        );
        const originalTags = [...extractedTags, ...ordinaryTags];

        const book = createBookFromParseServerData({
            objectId: "roundtrip-all",
            tags: [...originalTags],
        });

        // Sanity: the extracted tags really were stripped out of book.tags.
        for (const extracted of extractedTags) {
            expect(book.tags).not.toContain(extracted);
        }

        // Order-insensitive: getTagsForSaving() reconstructs the full set.
        expect([...book.getTagsForSaving()].sort()).toEqual(
            [...originalTags].sort()
        );
    });

    test.each(extractedTagPrefixes)(
        "re-merges the '%s' field on its own",
        (prefix) => {
            const extractedTag = `${prefix}1`;
            const originalTags = [extractedTag, ...ordinaryTags];

            const book = createBookFromParseServerData({
                objectId: `roundtrip-${prefix}`,
                tags: [...originalTags],
            });

            expect(book.tags).not.toContain(extractedTag);
            expect([...book.getTagsForSaving()].sort()).toEqual(
                [...originalTags].sort()
            );
        }
    );
});
