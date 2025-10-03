import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import type { IBookRepository } from "../interfaces/IBookRepository";
import type { ILanguageRepository } from "../interfaces/ILanguageRepository";
import type { ITagRepository } from "../interfaces/ITagRepository";
import type { IFilter } from "FilterTypes";
import type { BookSearchQuery } from "../types/QueryTypes";

const shouldRunDevTests = process.env.RUN_DEV_PARSE_TESTS === "true";

if (shouldRunDevTests) {
    vi.doMock("../../connection/DataSource", async () => {
        const actual = await vi.importActual<
            typeof import("../../connection/DataSource")
        >("../../connection/DataSource");
        return {
            ...actual,
            getDataSource: () => actual.DataSource.Dev,
        };
    });
}

(shouldRunDevTests ? describe : describe.skip)(
    "ParseServer dev read integration",
    () => {
        let bookRepository: IBookRepository;
        let languageRepository: ILanguageRepository;
        let tagRepository: ITagRepository;
        let ParseConnection: typeof import("../implementations/parseserver/ParseConnection").ParseConnection;
        let lastSearchedBookId: string | undefined;

        beforeAll(async () => {
            const parseConnectionModule = await import(
                "../implementations/parseserver/ParseConnection"
            );
            ParseConnection = parseConnectionModule.ParseConnection;

            const { ParseBookRepository } = await import(
                "../implementations/parseserver/ParseBookRepository"
            );
            bookRepository = new ParseBookRepository();

            const { ParseLanguageRepository } = await import(
                "../implementations/parseserver/ParseLanguageRepository"
            );
            languageRepository = new ParseLanguageRepository();

            const { ParseTagRepository } = await import(
                "../implementations/parseserver/ParseTagRepository"
            );
            tagRepository = new ParseTagRepository();
        });

        beforeEach(() => {
            ParseConnection.reset();
        });

        it("searches for books on the dev server", async () => {
            const query: BookSearchQuery = {
                filter: {} as IFilter,
                pagination: { limit: 5, skip: 0 },
            };

            const result = await bookRepository.searchBooks(query);

            expect(result.items.length).toBeGreaterThan(0);
            const first = result.items[0];
            expect(first.title).toBeTruthy();
            lastSearchedBookId =
                (first as any).objectId || first.id || undefined;
            expect(lastSearchedBookId).toBeTruthy();
        }, 30000);

        it("retrieves book detail for a found book", async () => {
            expect(lastSearchedBookId).toBeTruthy();
            if (!lastSearchedBookId) {
                throw new Error("Expected a searched book id to reuse");
            }

            const detail = await bookRepository.getBook(lastSearchedBookId);

            expect(detail).not.toBeNull();
            expect(detail?.title).toBeTruthy();
            const detailId =
                (detail as any)?.objectId || detail?.id || undefined;
            expect(detailId).toBe(lastSearchedBookId);
        }, 30000);

        it("loads languages from the dev server", async () => {
            const languages = await languageRepository.getLanguageInfo("en");

            expect(languages.length).toBeGreaterThan(0);
            expect(
                languages.some(
                    (language) =>
                        (language as any).isoCode === "en" ||
                        (language as any).bcp47 === "en"
                )
            ).toBe(true);
        }, 30000);

        it("loads tags and topics from the dev server", async () => {
            const tags = await tagRepository.getTagList();
            expect(tags.length).toBeGreaterThan(0);

            const topics = await tagRepository.getTopicList();
            expect(Array.isArray(topics)).toBe(true);
        }, 30000);
    }
);
