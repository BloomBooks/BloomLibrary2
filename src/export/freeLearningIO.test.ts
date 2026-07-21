import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import type { IFilter } from "FilterTypes";
import type {
    BookSearchQuery,
    BookSearchResult,
} from "../data-layer/types/QueryTypes";

const searchBooksMock = vi.hoisted(() => vi.fn());
const saveAsMock = vi.hoisted(() => vi.fn());

vi.mock("../data-layer", () => ({
    getBookRepository: () => ({ searchBooks: searchBooksMock }),
    getAuthenticationService: () => ({ getSessionToken: () => "" }),
}));

vi.mock("file-saver", () => ({
    default: { saveAs: saveAsMock },
}));

import giveFreeLearningCsv from "./freeLearningIO";

// jsdom's Blob doesn't implement .text(), so stub the global with a minimal
// fake that just records what it was constructed with; that's all these
// tests need to inspect.
class FakeBlob {
    public readonly parts: string[];
    public readonly type: string;
    constructor(parts: string[], options?: { type?: string }) {
        this.parts = parts;
        this.type = options?.type ?? "";
    }
    text(): string {
        return this.parts.join("");
    }
}

// Minimal stand-in for a data-layer Book: only the fields freeLearningIO.ts
// actually reads. Cast to `any` at the call site rather than constructing a
// real Book instance (mirrors the `books: any[] = [...]` pattern used in
// ParseBookRepository.test.ts).
function makeBook(overrides: Record<string, unknown> = {}) {
    return {
        id: "book-1",
        title: "A Title",
        allTitles: new Map<string, string>(),
        license: "cc-by",
        summary: "A summary",
        publisher: "A Publisher",
        updatedAt: "2024-01-01T00:00:00.000Z",
        uploadDate: new Date("2024-01-01T00:00:00.000Z"),
        phashOfFirstContentImage: "abcdef1234567890",
        languages: [{ isoCode: "en" }],
        artifactsToOfferToUsers: {
            readOnline: { decision: true },
            epub: { decision: false },
        },
        getBestLevel: () => "2",
        ...overrides,
    };
}

describe("giveFreeLearningCsv / getFreeLearningBooks", () => {
    beforeEach(() => {
        searchBooksMock.mockReset();
        saveAsMock.mockReset();
        vi.stubGlobal("Blob", FakeBlob);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("queries the book repository with the harvestState/otherTags/inCirculation-default mapping and an unbounded page size", async () => {
        searchBooksMock.mockResolvedValueOnce(({
            books: [],
        } as unknown) as BookSearchResult);

        await giveFreeLearningCsv();

        expect(searchBooksMock).toHaveBeenCalledTimes(1);
        const query: BookSearchQuery = searchBooksMock.mock.calls[0][0];
        expect(query.filter).toEqual<IFilter>({
            otherTags: "system:FreeLearningIO",
            search: "harvestState:Done",
        });
        expect(query.pagination).toEqual({
            limit: Number.MAX_SAFE_INTEGER,
            skip: 0,
        });
    });

    it("builds one CSV line per language for a book with a visible Read Online artifact, and saves it as a CSV blob", async () => {
        const book = makeBook();
        searchBooksMock.mockResolvedValueOnce(({
            books: [book],
        } as unknown) as BookSearchResult);

        await giveFreeLearningCsv();

        expect(saveAsMock).toHaveBeenCalledTimes(1);
        const [blob, filename] = saveAsMock.mock.calls[0];
        expect(filename).toBe("bloom-for-freelearning-io.csv");
        expect(blob.type).toBe("text/csv;charset=utf-8");

        const csv = await blob.text();
        const fields = csv.split(",");
        expect(fields[0]).toBe("A Title"); // no allTitles entry for "en" -> falls back to book.title
        expect(fields[3]).toBe("en"); // dc:language
        expect(fields[4]).toBe("2"); // level
        expect(fields[6]).toBe("A Publisher");
        expect(fields[7]).toBe("CC-BY-4.0"); // license, uppercased + "-4.0"
        expect(csv).toContain(`bookLang=en`);
    });

    it("excludes non-CC-licensed books and books whose Read Online artifact is hidden", async () => {
        const nonCcBook = makeBook({ id: "book-2", license: "ask" });
        const hiddenReadOnlineBook = makeBook({
            id: "book-3",
            artifactsToOfferToUsers: {
                readOnline: { decision: false },
                epub: { decision: false },
            },
        });
        searchBooksMock.mockResolvedValueOnce(({
            books: [nonCcBook, hiddenReadOnlineBook],
        } as unknown) as BookSearchResult);

        await giveFreeLearningCsv();

        expect(saveAsMock).toHaveBeenCalledTimes(1);
        const [blob] = saveAsMock.mock.calls[0];
        const csv = await blob.text();
        expect(csv).toBe("");
    });
});
