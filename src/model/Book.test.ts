import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
    Book,
    createBookFromParseServerData,
    extractedTagPrefixes,
} from "./Book";
import { DataLayerFactory } from "../data-layer/factory/DataLayerFactory";

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

// The legacy connection layer (LibraryUpdates.updateBook) alerted the user when a
// book save failed. The data-layer repository pattern that replaced it left the
// save methods rejecting silently, and every call site is fire-and-forget, so a
// failed save would be invisible to a moderator. These tests guard the restored
// behavior: a failed save alerts the user, logs the error, and does NOT propagate
// as a rejection (which would become an unhandled rejection at the call sites).
describe("save failure reporting", () => {
    let alertSpy: ReturnType<typeof vi.spyOn>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

    function setupRepo(overrides: Record<string, unknown>) {
        const repo = {
            updateBook: vi.fn().mockResolvedValue(undefined),
            saveArtifactVisibility: vi.fn().mockResolvedValue(undefined),
            ...overrides,
        };
        vi.spyOn(DataLayerFactory, "getInstance").mockReturnValue(({
            createBookRepository: () => repo,
        } as unknown) as DataLayerFactory);
        return repo;
    }

    beforeEach(() => {
        alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
        consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("saveAdminData alerts the user and does not reject when the save fails", async () => {
        const saveError = new Error("network down");
        setupRepo({ updateBook: vi.fn().mockRejectedValue(saveError) });

        const book = createBookFromParseServerData({ objectId: "book-fail-1" });

        // Must resolve, not reject: the call sites don't await/catch, so a
        // rejection here would surface as an unhandled promise rejection.
        await expect(book.saveAdminData()).resolves.toBeUndefined();

        expect(alertSpy).toHaveBeenCalledTimes(1);
        expect(alertSpy).toHaveBeenCalledWith(saveError);
        expect(consoleErrorSpy).toHaveBeenCalledWith(saveError);
    });

    test("saveArtifactVisibility alerts the user and does not reject when the save fails", async () => {
        const saveError = new Error("save visibility failed");
        setupRepo({
            saveArtifactVisibility: vi.fn().mockRejectedValue(saveError),
        });

        const book = createBookFromParseServerData({ objectId: "book-fail-2" });

        await expect(book.saveArtifactVisibility()).resolves.toBeUndefined();

        expect(alertSpy).toHaveBeenCalledTimes(1);
        expect(alertSpy).toHaveBeenCalledWith(saveError);
        expect(consoleErrorSpy).toHaveBeenCalledWith(saveError);
    });

    test("saveAdminData does not alert when the save succeeds", async () => {
        setupRepo({});

        const book = createBookFromParseServerData({ objectId: "book-ok" });
        await expect(book.saveAdminData()).resolves.toBeUndefined();

        expect(alertSpy).not.toHaveBeenCalled();
    });
});
