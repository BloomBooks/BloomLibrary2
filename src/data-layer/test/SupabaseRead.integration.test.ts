import { describe, it, expect, beforeAll } from "vitest";
import type { IBookRepository } from "../interfaces/IBookRepository";
import type { ILanguageRepository } from "../interfaces/ILanguageRepository";
import type { ITagRepository } from "../interfaces/ITagRepository";
import type { IFilter } from "FilterTypes";
import type { BookSearchQuery } from "../types/QueryTypes";

// Run against the local Supabase stack (see D:/blorg env / team docs for how
// it's started) with: RUN_SUPABASE_TESTS=true yarn vitest run
// src/data-layer/test/SupabaseRead.integration.test.ts
const shouldRunSupabaseTests = process.env.RUN_SUPABASE_TESTS === "true";

(shouldRunSupabaseTests ? describe : describe.skip)(
    "Supabase read integration",
    () => {
        let bookRepository: IBookRepository;
        let languageRepository: ILanguageRepository;
        let tagRepository: ITagRepository;
        let lastSearchedBookId: string | undefined;

        beforeAll(async () => {
            const { SupabaseBookRepository } = await import(
                "../implementations/supabase/SupabaseBookRepository"
            );
            bookRepository = new SupabaseBookRepository();

            const { SupabaseLanguageRepository } = await import(
                "../implementations/supabase/SupabaseLanguageRepository"
            );
            languageRepository = new SupabaseLanguageRepository();

            const { SupabaseTagRepository } = await import(
                "../implementations/supabase/SupabaseTagRepository"
            );
            tagRepository = new SupabaseTagRepository();
        });

        it("searches for books with an empty filter", async () => {
            const query: BookSearchQuery = {
                filter: {} as IFilter,
                pagination: { limit: 5, skip: 0 },
            };

            const result = await bookRepository.searchBooks(query);

            expect(result.errorString).toBeNull();
            expect(result.items.length).toBeGreaterThan(0);
            const first = result.items[0];
            expect(first.title).toBeTruthy();
            expect(first.id).toBeTruthy();
            lastSearchedBookId = first.id;
        }, 30000);

        it("retrieves book detail with langPointers populated for a found book", async () => {
            expect(lastSearchedBookId).toBeTruthy();
            if (!lastSearchedBookId) {
                throw new Error("Expected a searched book id to reuse");
            }

            const detail = await bookRepository.getBook(lastSearchedBookId);

            expect(detail).not.toBeNull();
            expect(detail?.title).toBeTruthy();
            expect(detail?.id).toBe(lastSearchedBookId);
            expect(Array.isArray(detail?.languages)).toBe(true);
        }, 30000);

        it("loads a tag list with more than 100 names", async () => {
            const tags = await tagRepository.getTagList();
            expect(tags.length).toBeGreaterThan(100);
        }, 30000);

        it("loads a topic list containing only topic:* entries", async () => {
            const topics = await tagRepository.getTopicList();
            expect(Array.isArray(topics)).toBe(true);
            expect(topics.length).toBeGreaterThan(0);
            topics.forEach((topic) => {
                expect(topic.name.toLowerCase().startsWith("topic:")).toBe(
                    true
                );
            });
        }, 30000);

        it("loads a cleaned and ordered language list with usageCount populated", async () => {
            const languages = await languageRepository.getCleanedAndOrderedLanguageList();

            expect(languages.length).toBeGreaterThan(5);
            languages.forEach((language) => {
                expect(typeof language.usageCount).toBe("number");
            });
        }, 30000);

        // Regression guards: every filter must CONSTRAIN. A dropped filter
        // silently degenerates to "all books", which looks like a result
        // (this is exactly how the unimplemented bookHash: facet escaped —
        // /bookHash:xyz showed all 112 books).

        async function getTotalBookCount(): Promise<number> {
            return bookRepository.getBookCount({} as IFilter);
        }

        it("bookHash: search facet returns only books with that hash", async () => {
            // Find a real hash in whatever data is loaded, then search for it.
            const seed = await bookRepository.searchBooks({
                filter: {} as IFilter,
                pagination: { limit: 50, skip: 0 },
            });
            const withHash = seed.books.find(
                (b) => (b as any).bookHashFromImages
            );
            expect(
                withHash,
                "sample data should include a hashed book"
            ).toBeTruthy();
            const hash = (withHash as any).bookHashFromImages as string;

            const result = await bookRepository.searchBooks({
                filter: { search: `bookHash:${hash}` } as IFilter,
            });

            const total = await getTotalBookCount();
            expect(result.errorString).toBeNull();
            expect(result.books.length).toBeGreaterThan(0);
            expect(result.books.length).toBeLessThan(total);
            result.books.forEach((b) =>
                expect((b as any).bookHashFromImages).toBe(hash)
            );
        }, 30000);

        it("title: search facet constrains results", async () => {
            const seed = await bookRepository.searchBooks({
                filter: {} as IFilter,
                pagination: { limit: 5, skip: 0 },
            });
            // Use a distinctive-enough fragment of a real title.
            const fragment = seed.books[0].title
                .split(/\s+/)
                .find((w) => w.length >= 5);
            expect(fragment).toBeTruthy();

            const result = await bookRepository.searchBooks({
                filter: { search: `title:${fragment}` } as IFilter,
            });

            const total = await getTotalBookCount();
            expect(result.errorString).toBeNull();
            expect(result.books.length).toBeGreaterThan(0);
            expect(result.books.length).toBeLessThan(total);
            result.books.forEach((b) =>
                expect(b.title.toLowerCase()).toContain(fragment!.toLowerCase())
            );
        }, 30000);

        it("the 'Other' topic (exclude all known topics) neither errors nor returns everything", async () => {
            // Exercises the negated array-overlap path (.not("tags","ov",...)),
            // which requires a PostgreSQL array literal — this query used to
            // 400 on every language page's "Other" row.
            const result = await bookRepository.searchBooks({
                filter: { topic: "Other" } as IFilter,
            });

            const { kTopicList } = await import(
                "../../model/ClosedVocabularies"
            );
            const canonical = new Set(kTopicList.map((t) => `topic:${t}`));
            const total = await getTotalBookCount();
            expect(result.errorString).toBeNull();
            expect(result.books.length).toBeLessThan(total);
            // "Other" means no CANONICAL topic; non-canonical topic tags
            // (e.g. topic:Spiritual) legitimately remain, as in Parse.
            result.books.forEach((b) => {
                const canonicalTopics = (b.tags ?? []).filter((t: string) =>
                    canonical.has(t)
                );
                expect(canonicalTopics).toEqual([]);
            });
        }, 30000);
    }
);
