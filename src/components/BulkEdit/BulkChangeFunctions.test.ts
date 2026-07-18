import { describe, test, expect, vi, beforeEach } from "vitest";
import { AddTagAllBooksInFilter } from "./BulkChangeFunctions";
import { DataLayerFactory } from "../../data-layer/factory/DataLayerFactory";
import { createBookFromParseServerData } from "../../model/Book";

// getBooksForGrid returns Book instances whose "level:X" tag has been stripped
// out of the tags array and stored in book.level. These tests guard against a
// regression where the bulk tag path wrote the level-stripped array back and
// thereby erased every affected book's reading level.
describe("AddTagAllBooksInFilter", () => {
    let updateBook: ReturnType<typeof vi.fn>;

    function setupRepoWithBooks(books: unknown[]) {
        updateBook = vi.fn().mockResolvedValue(undefined);
        const getBooksForGrid = vi.fn().mockResolvedValue({
            onePageOfMatchingBooks: books,
            totalMatchingBooksCount: books.length,
        });
        const repo = { getBooksForGrid, updateBook };
        vi.spyOn(DataLayerFactory, "getInstance").mockReturnValue(({
            createBookRepository: () => repo,
        } as unknown) as DataLayerFactory);
    }

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    test("re-adds the level tag so bulk tag changes don't erase reading levels", async () => {
        const book = createBookFromParseServerData({
            objectId: "book1",
            title: "Has Level",
            tags: ["level:3", "topic:Math"],
        });
        // Sanity: the level tag really has been stripped into book.level.
        expect(book.tags).not.toContain("level:3");
        expect(book.level).toBe("3");

        setupRepoWithBooks([book]);

        await AddTagAllBooksInFilter({} as never, "topic:Science", vi.fn());

        expect(updateBook).toHaveBeenCalledTimes(1);
        const [id, payload] = updateBook.mock.calls[0];
        expect(id).toBe("book1");
        expect(payload.tags).toContain("level:3");
        expect(payload.tags).toContain("topic:Science");
        expect(payload.tags).toContain("topic:Math");
    });

    test("does not add a spurious level tag when the book has no level", async () => {
        const book = createBookFromParseServerData({
            objectId: "book2",
            title: "No Level",
            tags: ["topic:Math"],
        });

        setupRepoWithBooks([book]);

        await AddTagAllBooksInFilter({} as never, "topic:Science", vi.fn());

        const [, payload] = updateBook.mock.calls[0];
        expect(payload.tags).toEqual(["topic:Math", "topic:Science"]);
    });

    test("preserves the level tag when removing a different tag", async () => {
        const book = createBookFromParseServerData({
            objectId: "book3",
            title: "Remove A Tag",
            tags: ["level:2", "topic:Math", "topic:Science"],
        });

        setupRepoWithBooks([book]);

        await AddTagAllBooksInFilter({} as never, "-topic:Science", vi.fn());

        const [, payload] = updateBook.mock.calls[0];
        expect(payload.tags).toContain("level:2");
        expect(payload.tags).toContain("topic:Math");
        expect(payload.tags).not.toContain("topic:Science");
    });
});
