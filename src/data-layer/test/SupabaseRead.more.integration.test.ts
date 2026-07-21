import { describe, it, expect, beforeAll } from "vitest";
import type { IBookRepository } from "../interfaces/IBookRepository";
import type { ILanguageRepository } from "../interfaces/ILanguageRepository";
import type { ITagRepository } from "../interfaces/ITagRepository";
import type { IFilter } from "FilterTypes";
import type { BookSearchQuery } from "../types/QueryTypes";
import { BookOrderingScheme } from "../types/CommonTypes";

// Additional Supabase read-path integration coverage, added after the local
// dev DB was grown from ~112 to ~699 books via a production-Parse sample
// importer (see SWITCHOVER-READINESS.md / the companion import task). This
// file exercises IFilter shapes not covered by SupabaseRead.integration.test.ts:
// publisher, level:, feature, language+topic combinations, otherTags (exact
// and wildcard), anyOfThese/derivedFrom union semantics, bookCount
// consistency, pagination-window disjointness, and a scale sanity check.
//
// Run with: RUN_SUPABASE_TESTS=true npx vitest run
// src/data-layer/test/SupabaseRead.more.integration.test.ts
const shouldRunSupabaseTests = process.env.RUN_SUPABASE_TESTS === "true";

// A limit large enough to capture "all" ~699 books in a single page for
// client-side set computations (union/dedupe/subset checks).
const BIG_LIMIT = 1000;

(shouldRunSupabaseTests ? describe : describe.skip)(
    "Supabase read integration (more filter shapes)",
    () => {
        let bookRepository: IBookRepository;
        let languageRepository: ILanguageRepository;
        let tagRepository: ITagRepository;

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

        async function getTotalBookCount(): Promise<number> {
            return bookRepository.getBookCount({} as IFilter);
        }

        // Fetches every matching book id for a filter, looping over pages so
        // callers get a true "all matches" set even if it exceeds BIG_LIMIT /
        // any server-side row cap.
        async function getAllMatchingIds(filter: IFilter): Promise<string[]> {
            const ids: string[] = [];
            let skip = 0;
            // Safety valve: with ~699 books total this should never loop more
            // than once or twice, but guard against an infinite loop if a
            // filter bug causes range() to never exhaust.
            for (let i = 0; i < 50; i++) {
                const page: BookSearchQuery = {
                    filter,
                    pagination: { limit: BIG_LIMIT, skip },
                };
                const result = await bookRepository.searchBooks(page);
                expect(result.errorString).toBeNull();
                ids.push(...result.books.map((b) => b.id));
                if (result.books.length < BIG_LIMIT) {
                    break;
                }
                skip += BIG_LIMIT;
            }
            return ids;
        }

        it("publisher: filter constrains to an exact publisher match", async () => {
            // Discover a real publisher value dynamically rather than
            // hardcoding one, since the imported sample can change.
            const seed = await bookRepository.searchBooks({
                filter: {} as IFilter,
                pagination: { limit: BIG_LIMIT, skip: 0 },
            });
            const withPublisher = seed.books.find(
                (b) => b.publisher && b.publisher.trim().length > 0
            );
            expect(
                withPublisher,
                "sample data should include at least one book with a publisher"
            ).toBeTruthy();
            const publisher = withPublisher!.publisher;

            const result = await bookRepository.searchBooks({
                filter: { publisher } as IFilter,
                pagination: { limit: BIG_LIMIT, skip: 0 },
            });
            const total = await getTotalBookCount();

            expect(result.errorString).toBeNull();
            expect(result.books.length).toBeGreaterThan(0);
            expect(result.books.length).toBeLessThan(total);
            result.books.forEach((b) => expect(b.publisher).toBe(publisher));

            // bookCount consistency check.
            const count = await bookRepository.getBookCount({
                publisher,
            } as IFilter);
            expect(count).toBe(result.totalMatchingRecords);
            expect(count).toBe(result.books.length);
        }, 30000);

        it("level: search facet returns books at that level, excluding the other primary levels", async () => {
            const result = await bookRepository.searchBooks({
                filter: { search: "level:2" } as IFilter,
                pagination: { limit: BIG_LIMIT, skip: 0 },
            });
            const total = await getTotalBookCount();

            expect(result.errorString).toBeNull();
            expect(result.books.length).toBeGreaterThan(0);
            expect(result.books.length).toBeLessThan(total);
            result.books.forEach((b) => {
                const tags = b.tags ?? [];
                const hasLevel2 =
                    tags.includes("level:2") ||
                    tags.includes("computedLevel:2");
                expect(hasLevel2).toBe(true);
                ["1", "3", "4"].forEach((other) => {
                    expect(tags).not.toContain(`level:${other}`);
                });
            });
        }, 30000);

        it("feature: filter (talkingBook) returns only books with that feature", async () => {
            const result = await bookRepository.searchBooks({
                filter: { feature: "talkingBook" } as IFilter,
                pagination: { limit: BIG_LIMIT, skip: 0 },
            });
            const total = await getTotalBookCount();

            expect(result.errorString).toBeNull();
            // The sample importer intentionally pulled talking books, so this
            // must be non-empty.
            expect(result.books.length).toBeGreaterThan(0);
            expect(result.books.length).toBeLessThan(total);
            result.books.forEach((b) =>
                expect(b.features ?? []).toContain("talkingBook")
            );

            const count = await bookRepository.getBookCount({
                feature: "talkingBook",
            } as IFilter);
            expect(count).toBe(result.totalMatchingRecords);
            expect(count).toBe(result.books.length);
        }, 30000);

        it("otherTags: exact match constrains to books carrying that exact tag", async () => {
            // topic:Health is one of the canonical topics; confirm it has
            // hits in this sample before asserting against it.
            const probe = await bookRepository.searchBooks({
                filter: { otherTags: "topic:Health" } as IFilter,
                pagination: { limit: BIG_LIMIT, skip: 0 },
            });
            expect(
                probe.books.length,
                "expected at least one topic:Health book in the sample"
            ).toBeGreaterThan(0);

            const total = await getTotalBookCount();
            expect(probe.errorString).toBeNull();
            expect(probe.books.length).toBeLessThan(total);
            probe.books.forEach((b) =>
                expect(b.tags ?? []).toContain("topic:Health")
            );
        }, 30000);

        it("otherTags: wildcard pattern constrains to tags matching the pattern", async () => {
            // Discover a real tag prefix from the tag list rather than
            // hardcoding one, then build a "X*" wildcard from it (distinct
            // from the existing file's "topic:Anim*" case).
            const allTags = await tagRepository.getTagList();
            const languageTagCandidate = allTags.find((t) =>
                t.startsWith("bookshelf:")
            );
            expect(
                languageTagCandidate,
                "expected at least one bookshelf: tag in the sample"
            ).toBeTruthy();
            const prefix = languageTagCandidate!.slice(
                0,
                "bookshelf:".length + 1
            );
            const wildcard = `${prefix}*`;

            const result = await bookRepository.searchBooks({
                filter: { otherTags: wildcard } as IFilter,
                pagination: { limit: BIG_LIMIT, skip: 0 },
            });
            const total = await getTotalBookCount();

            expect(result.errorString).toBeNull();
            expect(result.books.length).toBeGreaterThan(0);
            expect(result.books.length).toBeLessThan(total);
            result.books.forEach((b) => {
                expect(
                    (b.tags ?? []).some((t: string) => t.startsWith(prefix))
                ).toBe(true);
            });
        }, 30000);

        it("language + topic combination returns a subset of the language-only results", async () => {
            const languages = await languageRepository.getCleanedAndOrderedLanguageList();
            const languageWithBooks = languages.find(
                (l) => l.usageCount && l.usageCount > 5
            );
            expect(
                languageWithBooks,
                "expected at least one language with several books"
            ).toBeTruthy();
            const isoCode = languageWithBooks!.isoCode;

            const languageOnly = await bookRepository.searchBooks({
                filter: { language: isoCode } as IFilter,
                pagination: { limit: BIG_LIMIT, skip: 0 },
            });
            expect(languageOnly.errorString).toBeNull();
            expect(languageOnly.books.length).toBeGreaterThan(0);
            const languageOnlyIds = new Set(
                languageOnly.books.map((b) => b.id)
            );

            // Find a canonical topic that actually has hits, so the combined
            // filter isn't trivially empty.
            const { kTopicList } = await import(
                "../../model/ClosedVocabularies"
            );
            let topicWithHits: string | undefined;
            for (const topic of kTopicList) {
                const probe = await bookRepository.searchBooks({
                    filter: { otherTags: `topic:${topic}` } as IFilter,
                    pagination: { limit: 1, skip: 0 },
                });
                if (probe.books.length > 0) {
                    topicWithHits = topic;
                    break;
                }
            }
            expect(
                topicWithHits,
                "expected at least one canonical topic with hits"
            ).toBeTruthy();

            const combined = await bookRepository.searchBooks({
                filter: {
                    language: isoCode,
                    topic: topicWithHits,
                } as IFilter,
                pagination: { limit: BIG_LIMIT, skip: 0 },
            });
            expect(combined.errorString).toBeNull();

            // Robust regardless of whether the combination has hits: every
            // combined-result id must be in the language-only set.
            combined.books.forEach((b) => {
                expect(languageOnlyIds.has(b.id)).toBe(true);
            });
            expect(combined.books.length).toBeLessThanOrEqual(
                languageOnly.books.length
            );
        }, 30000);

        it("topic: filter resolves a NON-canonical topic to real books via the match_topic_tags RPC", async () => {
            const { kTopicList } = await import(
                "../../model/ClosedVocabularies"
            );
            const canonicalLc = new Set(kTopicList.map((t) => t.toLowerCase()));
            // Find a topic:<X> tag whose <X> is NOT canonical AND is actually
            // carried by at least one visible book -- exactly the case the
            // Supabase builder used to silently drop (empty shelf where Parse
            // showed books). The tag vocabulary contains topic:<X> entries no
            // current book uses, so probe (via an exact otherTags match) until
            // one with hits turns up.
            const allTags = await tagRepository.getTagList();
            const nonCanonicalCandidates = allTags.filter(
                (t) =>
                    t.startsWith("topic:") &&
                    !canonicalLc.has(t.slice("topic:".length).toLowerCase())
            );
            let nonCanonicalTag: string | undefined;
            for (const candidate of nonCanonicalCandidates) {
                const probe = await bookRepository.searchBooks({
                    filter: { otherTags: candidate } as IFilter,
                    pagination: { limit: 1, skip: 0 },
                });
                if (probe.books.length > 0) {
                    nonCanonicalTag = candidate;
                    break;
                }
            }
            expect(
                nonCanonicalTag,
                "expected at least one non-canonical topic:<X> tag carried by a book"
            ).toBeTruthy();
            const topicValue = nonCanonicalTag!.slice("topic:".length);

            const result = await bookRepository.searchBooks({
                filter: { topic: topicValue } as IFilter,
                pagination: { limit: BIG_LIMIT, skip: 0 },
            });
            const total = await getTotalBookCount();

            expect(result.errorString).toBeNull();
            // The whole point of the RPC: a non-canonical topic now returns
            // books instead of an empty shelf.
            expect(result.books.length).toBeGreaterThan(0);
            expect(result.books.length).toBeLessThan(total);
            result.books.forEach((b) =>
                expect(b.tags ?? []).toContain(nonCanonicalTag)
            );

            // bookCount stays consistent with searchBooks for this filter.
            const count = await bookRepository.getBookCount({
                topic: topicValue,
            } as IFilter);
            expect(count).toBe(result.totalMatchingRecords);
            expect(count).toBe(result.books.length);
        }, 30000);

        it("topic: filter with a nonsense non-canonical value returns an empty shelf", async () => {
            const result = await bookRepository.searchBooks({
                filter: {
                    topic: "ZzzDefinitelyNotARealTopic__xyz",
                } as IFilter,
                pagination: { limit: BIG_LIMIT, skip: 0 },
            });
            expect(result.errorString).toBeNull();
            expect(result.books.length).toBe(0);
        }, 30000);

        it("anyOfThese unions two sub-filters with correct client-side de-duping", async () => {
            const subFilterA: IFilter = { feature: "talkingBook" } as IFilter;
            const subFilterB: IFilter = {
                otherTags: "topic:Health",
            } as IFilter;

            const idsA = await getAllMatchingIds(subFilterA);
            const idsB = await getAllMatchingIds(subFilterB);
            expect(idsA.length).toBeGreaterThan(0);
            expect(idsB.length).toBeGreaterThan(0);

            const expectedUnion = new Set([...idsA, ...idsB]);

            const unionResult = await bookRepository.searchBooks({
                filter: {
                    anyOfThese: [subFilterA, subFilterB],
                } as IFilter,
                pagination: { limit: BIG_LIMIT, skip: 0 },
            });
            expect(unionResult.errorString).toBeNull();

            const actualIds = unionResult.books.map((b) => b.id);
            const actualIdSet = new Set(actualIds);

            // (a) exact set match against the client-computed union.
            expect(actualIdSet.size).toBe(expectedUnion.size);
            actualIds.forEach((id) => expect(expectedUnion.has(id)).toBe(true));
            expectedUnion.forEach((id) =>
                expect(actualIdSet.has(id)).toBe(true)
            );

            // (b) no duplicate ids in the anyOfThese result.
            expect(actualIds.length).toBe(actualIdSet.size);

            // (c) result count equals the union size, not the naive sum --
            // proving de-dup works when the two sub-filters overlap (a book
            // can be both a talking book and tagged topic:Health).
            expect(unionResult.books.length).toBe(expectedUnion.size);
            expect(unionResult.totalMatchingRecords).toBe(expectedUnion.size);

            const naiveSum = idsA.length + idsB.length;
            // Only a meaningful assertion if there's actually overlap; log
            // either way so it's visible in test output.
            if (naiveSum !== expectedUnion.size) {
                expect(expectedUnion.size).toBeLessThan(naiveSum);
            }
        }, 30000);

        it("derivedFrom excludes the parent collection per the negation branch it matches", async () => {
            // Look for real lineage data first (the sample importer pulled a
            // "derivatives" category with non-empty bookLineage). We can't
            // read book_lineage off BookEntity directly (SupabaseBookMapper
            // doesn't expose it), so probe the underlying table directly via
            // the same shared SupabaseConnection the repositories use --
            // read-only, for test-data discovery only.
            const { SupabaseConnection } = await import(
                "../implementations/supabase/SupabaseConnection"
            );
            const client = SupabaseConnection.getClient();
            const { data: lineageRows, error } = await client
                .from("books")
                .select("id, book_instance_id, publisher, tags")
                .not("book_lineage_array", "eq", "{}")
                .limit(50);
            expect(error).toBeNull();

            const rowsWithParentSignal = (lineageRows ?? []).filter(
                (r: { publisher?: string | null; tags?: string[] | null }) =>
                    (r.publisher && r.publisher.trim().length > 0) ||
                    (r.tags ?? []).length > 0
            );

            if (rowsWithParentSignal.length > 0) {
                // Real-data path: pick a derivative row whose publisher (or a
                // tag) can identify its parent collection, and confirm
                // derivedFrom excludes books matching that same identifier.
                const withPublisher = rowsWithParentSignal.find(
                    (r: { publisher?: string | null }) =>
                        r.publisher && r.publisher.trim().length > 0
                );
                if (withPublisher) {
                    const parentPublisher = withPublisher.publisher as string;
                    const result = await bookRepository.searchBooks({
                        filter: {
                            derivedFrom: {
                                publisher: parentPublisher,
                            },
                        } as IFilter,
                        pagination: { limit: BIG_LIMIT, skip: 0 },
                    });
                    expect(result.errorString).toBeNull();
                    // The negation branch (neq publisher) must exclude any
                    // book that itself has that publisher.
                    result.books.forEach((b) => {
                        expect(b.publisher).not.toBe(parentPublisher);
                    });
                } else {
                    const withTag = rowsWithParentSignal.find(
                        (r: { tags?: string[] | null }) =>
                            (r.tags ?? []).length > 0
                    );
                    const parentTag = (withTag!.tags as string[])[0];
                    const result = await bookRepository.searchBooks({
                        filter: {
                            derivedFrom: {
                                otherTags: parentTag,
                            },
                        } as IFilter,
                        pagination: { limit: BIG_LIMIT, skip: 0 },
                    });
                    expect(result.errorString).toBeNull();
                    result.books.forEach((b) => {
                        expect(b.tags ?? []).not.toContain(parentTag);
                    });
                }
            } else {
                // Fallback path: no lineage data qualifies cleanly enough to
                // build a real parent-identifying sub-filter. Assert weaker
                // structural properties instead.
                // A sub-filter matching zero books must yield zero derivedFrom
                // matches.
                const zeroMatch = await bookRepository.searchBooks({
                    filter: {
                        derivedFrom: {
                            publisher: "__no_such_publisher_xyz__",
                        },
                    } as IFilter,
                    pagination: { limit: 10, skip: 0 },
                });
                expect(zeroMatch.errorString).toBeNull();
                expect(zeroMatch.books.length).toBe(0);

                // A sub-filter matching (effectively) the whole collection
                // should behave sanely (no error, no crash, a finite subset).
                const total = await getTotalBookCount();
                const broadMatch = await bookRepository.searchBooks({
                    filter: {
                        derivedFrom: {} as IFilter,
                    } as IFilter,
                    pagination: { limit: BIG_LIMIT, skip: 0 },
                });
                expect(broadMatch.errorString).toBeNull();
                expect(broadMatch.books.length).toBeLessThanOrEqual(total);
            }
        }, 30000);

        it("bookCount matches searchBooks totalMatchingRecords and actual returned length for otherTags/feature filters", async () => {
            const filters: IFilter[] = [
                { otherTags: "topic:Health" } as IFilter,
                { feature: "talkingBook" } as IFilter,
            ];

            for (const filter of filters) {
                const result = await bookRepository.searchBooks({
                    filter,
                    pagination: { limit: BIG_LIMIT, skip: 0 },
                });
                const count = await bookRepository.getBookCount(filter);

                expect(result.errorString).toBeNull();
                expect(count).toBe(result.totalMatchingRecords);
                expect(count).toBe(result.books.length);
            }
        }, 30000);

        it("pagination windows over the same filter are disjoint and correctly sized", async () => {
            const total = await getTotalBookCount();
            expect(total).toBeGreaterThan(20);

            const pageOne = await bookRepository.searchBooks({
                filter: {} as IFilter,
                pagination: { limit: 10, skip: 0 },
                orderingScheme: BookOrderingScheme.Default,
            });
            const pageTwo = await bookRepository.searchBooks({
                filter: {} as IFilter,
                pagination: { limit: 10, skip: 10 },
                orderingScheme: BookOrderingScheme.Default,
            });

            expect(pageOne.errorString).toBeNull();
            expect(pageTwo.errorString).toBeNull();
            expect(pageOne.books.length).toBe(10);
            expect(pageTwo.books.length).toBe(10);

            const idsOne = new Set(pageOne.books.map((b) => b.id));
            const idsTwo = pageTwo.books.map((b) => b.id);
            idsTwo.forEach((id) => expect(idsOne.has(id)).toBe(false));
        }, 30000);

        it("[scale] broad searchBooks completes within a generous time bound", async () => {
            const start = performance.now();
            const result = await bookRepository.searchBooks({
                filter: {} as IFilter,
                pagination: { limit: BIG_LIMIT, skip: 0 },
            });
            const elapsed = performance.now() - start;
            console.log(
                `[scale] broad searchBooks ({} filter, limit ${BIG_LIMIT}): ${elapsed.toFixed(
                    0
                )}ms`
            );

            expect(result.errorString).toBeNull();
            expect(elapsed).toBeLessThan(15000);
        }, 20000);

        it("[scale] anyOfThese searchBooks (two sub-filter round trips + .in()) completes within a generous time bound", async () => {
            const start = performance.now();
            const result = await bookRepository.searchBooks({
                filter: {
                    anyOfThese: [
                        { feature: "talkingBook" } as IFilter,
                        { otherTags: "topic:Health" } as IFilter,
                    ],
                } as IFilter,
                pagination: { limit: BIG_LIMIT, skip: 0 },
            });
            const elapsed = performance.now() - start;
            console.log(
                `[scale] anyOfThese searchBooks (talkingBook OR topic:Health): ${elapsed.toFixed(
                    0
                )}ms`
            );

            expect(result.errorString).toBeNull();
            expect(elapsed).toBeLessThan(15000);
        }, 30000);
    }
);
