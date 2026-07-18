// Unit tests for SupabaseBookQueryBuilder.ts -- the Parse-filter (IFilter) to
// PostgREST translation layer. No network / no local Supabase stack: a fake
// chainable query builder (fakeSupabaseQuery.ts) records the emitted
// .select/.eq/.ilike/... calls, and tests assert on that recorded call list.
//
// Existing behavior is treated as the spec here. Where the code comments
// call out a deliberate divergence from Parse (or a defensive branch that
// no current caller can actually reach), the test/comment says so rather
// than "fixing" it -- see the `NOTE:` comments below and the final report.
import { describe, it, expect, vi, afterEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { IFilter, BooleanOptions } from "FilterTypes";
import { BookOrderingScheme } from "../types/CommonTypes";
import {
    applyBookFilter,
    applyOrdering,
    BuildBookQueryOptions,
} from "../implementations/supabase/SupabaseBookQueryBuilder";
import { kTopicList } from "../../model/ClosedVocabularies";
import { Book } from "../../model/Book";
import {
    FakeSupabaseClient,
    FakeQuery,
    FakeQueryResolver,
    RecordedCall,
} from "./fakeSupabaseQuery";

// Small re-implementations of two private helpers in the source module
// (toPostgresArrayLiteral / escapeLikePattern) purely for building expected
// values in assertions below -- they aren't exported, so tests can't import
// them, but they're one-liners and unlikely to drift silently.
function toArrayLiteral(values: string[]): string {
    return (
        "{" +
        values.map((v) => '"' + v.replace(/(["\\])/g, "\\$1") + '"').join(",") +
        "}"
    );
}
function escapeLike(value: string): string {
    return value.replace(/([\\%_])/g, "\\$1");
}

const DEFAULT_GUARDS: RecordedCall[] = [
    { method: "eq", args: ["in_circulation", true] },
    { method: "eq", args: ["draft", false] },
    { method: "not", args: ["base_url", "is", null] },
];

const MARKER_SELECT = "__marker__";
const emptyResolver: FakeQueryResolver = () => ({
    data: [],
    error: null,
    count: 0,
});

async function runFilter(
    filter: IFilter,
    resolver: FakeQueryResolver = emptyResolver,
    options?: BuildBookQueryOptions
): Promise<{
    calls: RecordedCall[];
    client: FakeSupabaseClient;
    query: FakeQuery;
}> {
    const client = new FakeSupabaseClient(resolver);
    const initial = client.from("books").select(MARKER_SELECT);
    const { query } = await applyBookFilter(
        (client as unknown) as SupabaseClient,
        initial,
        filter,
        options
    );
    const q = query as FakeQuery;
    // Drop the marker `.select()` call the test harness made before handing
    // the builder off -- it's not part of what applyBookFilter emitted.
    return { calls: q.calls.slice(1), client, query: q };
}

describe("applyBookFilter", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("baseline in_circulation / draft / base_url / rebrand guards", () => {
        it("applies the default guards for a top-level query with no filter", async () => {
            const { calls } = await runFilter({} as IFilter);
            expect(calls).toEqual(DEFAULT_GUARDS);
        });

        it("applies no guards at all for an inner query with no filter", async () => {
            // Mirrors simplifyInnerQuery(): sub-filters of anyOfThese/derivedFrom
            // only get the in_circulation/draft guards if they explicitly set
            // them, and never get the baseUrl-not-null guard.
            const { calls } = await runFilter({} as IFilter, emptyResolver, {
                isInnerQuery: true,
            });
            expect(calls).toEqual([]);
        });

        it("honors explicit inCirculation/draft overrides on a top-level query", async () => {
            const { calls } = await runFilter({
                inCirculation: BooleanOptions.All,
                draft: BooleanOptions.Yes,
            } as IFilter);
            expect(calls).toEqual([
                { method: "eq", args: ["draft", true] },
                { method: "not", args: ["base_url", "is", null] },
            ]);
        });

        it("honors explicit inCirculation/draft on an inner query", async () => {
            const { calls } = await runFilter(
                {
                    inCirculation: BooleanOptions.No,
                    draft: BooleanOptions.No,
                } as IFilter,
                emptyResolver,
                { isInnerQuery: true }
            );
            expect(calls).toEqual([
                { method: "eq", args: ["in_circulation", false] },
                { method: "eq", args: ["draft", false] },
            ]);
        });

        it("applies the rebrand guard after the other top-level guards", async () => {
            const { calls } = await runFilter({
                rebrand: BooleanOptions.Yes,
            } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "eq", args: ["rebrand", true] },
            ]);
        });

        it("applies the rebrand guard on an inner query even though the other guards are skipped", async () => {
            const { calls } = await runFilter(
                { rebrand: BooleanOptions.No } as IFilter,
                emptyResolver,
                { isInnerQuery: true }
            );
            expect(calls).toEqual([{ method: "eq", args: ["rebrand", false] }]);
        });

        it("BooleanOptions.All on rebrand applies no guard at all", async () => {
            const { calls } = await runFilter({
                rebrand: BooleanOptions.All,
            } as IFilter);
            expect(calls).toEqual(DEFAULT_GUARDS);
        });
    });

    describe("free-text search", () => {
        it("ANDs one .ilike() per word against the search column", async () => {
            const { calls } = await runFilter({
                search: "science books",
            } as IFilter);
            expect(calls).toEqual([
                { method: "ilike", args: ["search", "%science%"] },
                { method: "ilike", args: ["search", "%books%"] },
                ...DEFAULT_GUARDS,
            ]);
        });

        it("processes facets before the remaining free-text words", async () => {
            const { calls } = await runFilter({
                search: "science title:Sun",
            } as IFilter);
            expect(calls).toEqual([
                { method: "ilike", args: ["title", "%Sun%"] },
                { method: "ilike", args: ["search", "%science%"] },
                ...DEFAULT_GUARDS,
            ]);
        });
    });

    describe("search facets that emit a query call directly", () => {
        it("title: ilikes the title column", async () => {
            const { calls } = await runFilter({
                search: "title:Sun",
            } as IFilter);
            expect(calls).toEqual([
                { method: "ilike", args: ["title", "%Sun%"] },
                ...DEFAULT_GUARDS,
            ]);
        });

        it("uploader: resolves the email pattern to user ids, then .in()s uploader_id", async () => {
            const resolver: FakeQueryResolver = (table) =>
                table === "users"
                    ? {
                          data: [{ id: "user-1" }, { id: "user-2" }],
                          error: null,
                      }
                    : { data: [], error: null, count: 0 };

            const { calls, client } = await runFilter(
                { search: "uploader:jane@example.com" } as IFilter,
                resolver
            );

            const usersQuery = client.queriesFor("users")[0];
            expect(usersQuery.calls).toEqual([
                { method: "select", args: ["id"] },
                { method: "ilike", args: ["email", "%jane@example.com%"] },
            ]);
            expect(calls).toEqual([
                { method: "in", args: ["uploader_id", ["user-1", "user-2"]] },
                ...DEFAULT_GUARDS,
            ]);
        });

        it("uploader: fails closed (__no_match__) when no user matches the email pattern", async () => {
            const { calls } = await runFilter({
                search: "uploader:nobody@example.com",
            } as IFilter);
            expect(calls).toEqual([
                { method: "in", args: ["uploader_id", ["__no_match__"]] },
                ...DEFAULT_GUARDS,
            ]);
        });

        it('feature:activity also matches "quiz" via overlaps', async () => {
            const { calls } = await runFilter({
                search: "feature:activity",
            } as IFilter);
            expect(calls).toEqual([
                {
                    method: "overlaps",
                    args: ["features", ["activity", "quiz"]],
                },
                ...DEFAULT_GUARDS,
            ]);
        });

        it("feature:<other> is a single-value contains", async () => {
            const { calls } = await runFilter({
                search: "feature:motion",
            } as IFilter);
            expect(calls).toEqual([
                { method: "contains", args: ["features", ["motion"]] },
                ...DEFAULT_GUARDS,
            ]);
        });

        it("bookInstanceId: matches exactly and relaxes draft/inCirculation to All", async () => {
            const { calls } = await runFilter({
                search: "bookInstanceId:abc-123",
            } as IFilter);
            expect(calls).toEqual([
                { method: "eq", args: ["book_instance_id", "abc-123"] },
                { method: "not", args: ["base_url", "is", null] },
            ]);
        });

        it.each([
            ["copyright:2020", "copyright", "%2020%"],
            ["country:US", "country", "%US%"],
            ["publisher:Acme", "publisher", "%Acme%"],
        ])(
            "%s ilikes the %s column with %s",
            async (searchTerm, column, expectedPattern) => {
                const { calls } = await runFilter({
                    search: searchTerm,
                } as IFilter);
                expect(calls[0]).toEqual({
                    method: "ilike",
                    args: [column, expectedPattern],
                });
            }
        );

        // NOTE: decided 2026-07-18: there is no `edition:` search facet, and
        // there never was a reachable one. splitString() (src/connection/
        // BookQueryBuilder.ts) only ever carves a `part` like "edition:2nd"
        // out of the search string if the prefix appears in its own
        // `facets` list -- and that list does NOT include "edition:" (it
        // has copyright:, country:, publisher:, originalPublisher:,
        // brandingProjectName:, branding:, etc., but no edition:). So
        // "edition:2nd" is never recognized as a facet; it falls through
        // untouched and gets AND-ilike'd against the `search` column as one
        // opaque word. The same shared `facets` list is used by Parse's
        // constructParseBookQuery(), so this was never reachable on either
        // backend. The corresponding dead `case "edition":` switch branches
        // have been removed from both SupabaseBookQueryBuilder.ts and
        // BookQueryBuilder.ts, and this file's header comment corrected to
        // stop listing "edition:" among the translated facets. This test
        // remains to pin down the intended (shared) behavior: `edition:` in
        // a search string is plain free text, not a facet.
        it("edition: is NOT recognized as a search facet (missing from the shared facets list)", async () => {
            const { calls } = await runFilter({
                search: "edition:2nd",
            } as IFilter);
            expect(calls[0]).toEqual({
                method: "ilike",
                args: ["search", "%edition:2nd%"],
            });
        });

        it("originalPublisher: maps camelCase to snake_case and escapes LIKE metacharacters", async () => {
            const { calls } = await runFilter({
                search: "originalPublisher:Acme%",
            } as IFilter);
            expect(calls[0]).toEqual({
                method: "ilike",
                args: ["original_publisher", `%${escapeLike("Acme%")}%`],
            });
        });

        it("brandingProjectName: and branding: both map to the branding_project_name column", async () => {
            const viaLongName = await runFilter({
                search: "brandingProjectName:Acme",
            } as IFilter);
            const viaShortName = await runFilter({
                search: "branding:Acme",
            } as IFilter);
            expect(viaLongName.calls[0]).toEqual({
                method: "ilike",
                args: ["branding_project_name", "%Acme%"],
            });
            expect(viaShortName.calls[0]).toEqual({
                method: "ilike",
                args: ["branding_project_name", "%Acme%"],
            });
        });

        it("license: is a case-insensitive EXACT match, not wrapped in wildcards", async () => {
            const { calls } = await runFilter({
                search: "license:cc-by",
            } as IFilter);
            expect(calls[0]).toEqual({
                method: "ilike",
                args: ["license", "cc-by"],
            });
        });

        it("license: escapes LIKE metacharacters in the value", async () => {
            const { calls } = await runFilter({
                search: "license:50%",
            } as IFilter);
            expect(calls[0]).toEqual({
                method: "ilike",
                args: ["license", escapeLike("50%")],
            });
        });

        it("phash: is a case-sensitive contains", async () => {
            const { calls } = await runFilter({
                search: "phash:AbCd",
            } as IFilter);
            expect(calls[0]).toEqual({
                method: "like",
                args: ["phash_of_first_content_image", "%AbCd%"],
            });
        });

        it("bookHash: is an exact match", async () => {
            const { calls } = await runFilter({
                search: "bookHash:deadbeef",
            } as IFilter);
            expect(calls[0]).toEqual({
                method: "eq",
                args: ["book_hash_from_images", "deadbeef"],
            });
        });

        it("harvestState: is an exact match", async () => {
            const { calls } = await runFilter({
                search: "harvestState:Harvested",
            } as IFilter);
            expect(calls[0]).toEqual({
                method: "eq",
                args: ["harvest_state", "Harvested"],
            });
        });
    });

    describe("search facets that only set a filter field (applied later)", () => {
        it("rebrand: sets the tri-state rebrand guard", async () => {
            const { calls } = await runFilter({
                search: "rebrand:true",
            } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "eq", args: ["rebrand", true] },
            ]);
        });

        it("language: defers to the normal iso-code resolution path", async () => {
            const resolver: FakeQueryResolver = (table) =>
                table === "languages"
                    ? { data: [{ id: "lang-9" }], error: null }
                    : { data: [], error: null };
            const { calls } = await runFilter(
                { search: "language:fr" } as IFilter,
                resolver
            );
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "overlaps", args: ["lang_pointers", ["lang-9"]] },
            ]);
        });

        it("level: collects a tag requirement applied after guards/language, not inline", async () => {
            const { calls } = await runFilter({ search: "level:2" } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                {
                    method: "overlaps",
                    args: ["tags", ["computedLevel:2", "level:2"]],
                },
                {
                    method: "not",
                    args: [
                        "tags",
                        "ov",
                        toArrayLiteral(["level:1", "level:3", "level:4"]),
                    ],
                },
            ]);
        });
    });

    describe("language filter (as a direct IFilter field, not via search)", () => {
        it("resolves an iso code to language ids and overlaps lang_pointers", async () => {
            const resolver: FakeQueryResolver = (table) =>
                table === "languages"
                    ? { data: [{ id: "lang-1" }], error: null }
                    : { data: [], error: null };
            const { calls, client } = await runFilter(
                { language: "en" } as IFilter,
                resolver
            );
            const langQuery = client.queriesFor("languages")[0];
            expect(langQuery.calls).toEqual([
                { method: "select", args: ["id"] },
                { method: "eq", args: ["iso_code", "en"] },
            ]);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "overlaps", args: ["lang_pointers", ["lang-1"]] },
            ]);
        });

        it("fails closed (__no_match__) when the iso code matches no language", async () => {
            const { calls } = await runFilter({ language: "xx" } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                {
                    method: "overlaps",
                    args: ["lang_pointers", ["__no_match__"]],
                },
            ]);
        });

        it('the "none" pseudo-language filters lang_pointers to an empty array', async () => {
            const { calls } = await runFilter({ language: "none" } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "filter", args: ["lang_pointers", "eq", "{}"] },
            ]);
        });
    });

    describe("topic", () => {
        it("a single canonical topic (case-insensitive) becomes an all-kind tags.contains()", async () => {
            const { calls } = await runFilter({ topic: "health" } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "contains", args: ["tags", ["topic:Health"]] },
            ]);
        });

        it("multiple canonical topics each get their own tags.contains() call", async () => {
            const { calls } = await runFilter({
                topic: "Health,Math",
            } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "contains", args: ["tags", ["topic:Health"]] },
                { method: "contains", args: ["tags", ["topic:Math"]] },
            ]);
        });

        // A resolver that answers the match_topic_tags RPC with the given tag
        // names and everything else (the outer books query) with an empty set.
        function topicRpcResolver(tags: string[]): FakeQueryResolver {
            return (table) =>
                table === "rpc:match_topic_tags"
                    ? { data: tags, error: null }
                    : { data: [], error: null, count: 0 };
        }

        it("resolves a single non-canonical topic via the match_topic_tags RPC and requires any matched tag (overlaps)", async () => {
            const { calls, client } = await runFilter(
                { topic: "Spiritual" } as IFilter,
                topicRpcResolver(["topic:Spiritual"])
            );
            // The non-canonical value is sent (prefix-less) to the RPC...
            const rpcQuery = client.queriesFor("rpc:match_topic_tags")[0];
            expect(rpcQuery.calls).toEqual([
                {
                    method: "rpc",
                    args: ["match_topic_tags", { topic_names: ["Spiritual"] }],
                },
            ]);
            // ...and the returned tag names become an any-of (overlaps) tag req.
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "overlaps", args: ["tags", ["topic:Spiritual"]] },
            ]);
        });

        it("combines a canonical topic (contains) with an RPC-resolved non-canonical topic (overlaps)", async () => {
            const { calls, client } = await runFilter(
                { topic: "Health,Spiritual" } as IFilter,
                topicRpcResolver(["topic:Spiritual"])
            );
            // Only the non-canonical value goes to the RPC; the canonical one
            // is handled locally.
            const rpcQuery = client.queriesFor("rpc:match_topic_tags")[0];
            expect(rpcQuery.calls).toEqual([
                {
                    method: "rpc",
                    args: ["match_topic_tags", { topic_names: ["Spiritual"] }],
                },
            ]);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "contains", args: ["tags", ["topic:Health"]] },
                { method: "overlaps", args: ["tags", ["topic:Spiritual"]] },
            ]);
        });

        it("passes every non-canonical topic to a single RPC call and overlaps all matched tags", async () => {
            const { calls, client } = await runFilter(
                { topic: "Spiritual,Template" } as IFilter,
                topicRpcResolver(["topic:Spiritual", "topic:Template"])
            );
            const rpcQueries = client.queriesFor("rpc:match_topic_tags");
            expect(rpcQueries).toHaveLength(1);
            expect(rpcQueries[0].calls).toEqual([
                {
                    method: "rpc",
                    args: [
                        "match_topic_tags",
                        { topic_names: ["Spiritual", "Template"] },
                    ],
                },
            ]);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                {
                    method: "overlaps",
                    args: ["tags", ["topic:Spiritual", "topic:Template"]],
                },
            ]);
        });

        it("fails closed (__no_match__) when the RPC resolves a non-canonical topic to no tags", async () => {
            const { calls } = await runFilter(
                { topic: "NotARealTopic" } as IFilter,
                topicRpcResolver([])
            );
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "overlaps", args: ["tags", ["__no_match__"]] },
            ]);
        });

        it("keeps a canonical topic but fails closed on an unresolvable non-canonical one", async () => {
            const { calls } = await runFilter(
                { topic: "Health,NotARealTopic" } as IFilter,
                topicRpcResolver([])
            );
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "contains", args: ["tags", ["topic:Health"]] },
                { method: "overlaps", args: ["tags", ["__no_match__"]] },
            ]);
        });

        it("logs and fails closed if the match_topic_tags RPC errors", async () => {
            const errorSpy = vi
                .spyOn(console, "error")
                .mockImplementation(() => {});
            const resolver: FakeQueryResolver = (table) =>
                table === "rpc:match_topic_tags"
                    ? { data: null, error: { message: "boom" } }
                    : { data: [], error: null, count: 0 };
            const { calls } = await runFilter(
                { topic: "Spiritual" } as IFilter,
                resolver
            );
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "overlaps", args: ["tags", ["__no_match__"]] },
            ]);
            expect(errorSpy).toHaveBeenCalled();
        });

        it('"Other" excludes every canonical topic via a negated array overlap', async () => {
            const { calls } = await runFilter({ topic: "Other" } as IFilter);
            const canonicalTags = kTopicList.map((t) => "topic:" + t);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                {
                    method: "not",
                    args: ["tags", "ov", toArrayLiteral(canonicalTags)],
                },
            ]);
        });
    });

    describe("otherTags (plain and wildcard)", () => {
        it("a single wildcard tag is matched via tags_text LIKE, not tags.contains()", async () => {
            const { calls } = await runFilter({
                otherTags: "bookshelf:Sample*",
            } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                {
                    method: "like",
                    args: ["tags_text", "%|bookshelf:Sample%"],
                },
            ]);
        });

        it("a leading-wildcard tag anchors the LIKE pattern on the end of the element", async () => {
            const { calls } = await runFilter({
                otherTags: "*Sample",
            } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "like", args: ["tags_text", "%Sample|%"] },
            ]);
        });

        it("a both-sides wildcard tag is a plain substring match", async () => {
            const { calls } = await runFilter({
                otherTags: "*Sample*",
            } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "like", args: ["tags_text", "%Sample%"] },
            ]);
        });

        it("mixes exact tags.contains() and wildcard tags_text LIKE within one all-kind requirement", async () => {
            const { calls } = await runFilter({
                otherTags: "topic:Foo, bookshelf:Test*",
            } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "contains", args: ["tags", ["topic:Foo"]] },
                { method: "like", args: ["tags_text", "%|bookshelf:Test%"] },
            ]);
        });

        // NOTE: possible coverage gap (not a bug): applyTagRequirements() also
        // has defensive branches for a wildcard tag inside an "any"-kind
        // requirement (fails closed with a console.warn + __no_match__) and
        // for a wildcard tag inside a "none"-kind requirement. Neither branch
        // is reachable through applyBookFilter's current public inputs:
        // "any"-kind requirements are only produced by the `level:` facet
        // (always literal, non-wildcard values), and "none"-kind requirements
        // only ever contain literal values too (topic "Other", level "empty").
        // Only otherTags/topic ever contribute wildcards, and those always
        // produce "all"-kind requirements. Since the function isn't exported,
        // these branches can't be exercised without a source change, so they
        // are intentionally left uncovered here rather than faked through a
        // path that doesn't exist today.
    });

    describe("level (empty)", () => {
        it('level: "empty" excludes every level/computedLevel tag', async () => {
            const { calls } = await runFilter({
                search: "level:empty",
            } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                {
                    method: "not",
                    args: [
                        "tags",
                        "ov",
                        toArrayLiteral([
                            "level:1",
                            "level:2",
                            "level:3",
                            "level:4",
                            "computedLevel:1",
                            "computedLevel:2",
                            "computedLevel:3",
                            "computedLevel:4",
                        ]),
                    ],
                },
            ]);
        });
    });

    describe("feature (direct IFilter field)", () => {
        it("is applied after tag requirements/guards, and supports an OR list via overlaps", async () => {
            const { calls } = await runFilter({
                feature: "quiz OR game",
            } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "overlaps", args: ["features", ["quiz", "game"]] },
            ]);
        });

        it('"activity" still expands to overlaps(["activity","quiz"]) as a direct field', async () => {
            const { calls } = await runFilter({
                feature: "activity",
            } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                {
                    method: "overlaps",
                    args: ["features", ["activity", "quiz"]],
                },
            ]);
        });
    });

    describe("keywordsText", () => {
        it("contains()-matches on the stemmed keywords, reusing Book.getKeywordsAndStems", async () => {
            const [, expectedStems] = Book.getKeywordsAndStems("cat dog");
            const { calls } = await runFilter({
                keywordsText: "cat dog",
            } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "contains", args: ["keyword_stems", expectedStems] },
            ]);
        });
    });

    describe("simple equality facets", () => {
        it("applies publisher/originalPublisher/edition/brandingProjectName/bookInstanceId/leveledReaderLevel/originalCredits in declaration order", async () => {
            const { calls } = await runFilter({
                publisher: "Acme",
                originalPublisher: "Acme Prior",
                edition: "2nd",
                brandingProjectName: "Acme Brand",
                bookInstanceId: "inst-1",
                leveledReaderLevel: 0,
                originalCredits: "Jane Doe",
            } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "eq", args: ["publisher", "Acme"] },
                { method: "eq", args: ["original_publisher", "Acme Prior"] },
                { method: "eq", args: ["edition", "2nd"] },
                { method: "eq", args: ["branding_project_name", "Acme Brand"] },
                { method: "eq", args: ["book_instance_id", "inst-1"] },
                { method: "eq", args: ["leveled_reader_level", 0] },
                { method: "eq", args: ["credits", "Jane Doe"] },
            ]);
        });

        it("leveledReaderLevel: 0 still applies (falsy-but-not-null guard)", async () => {
            const { calls } = await runFilter({
                leveledReaderLevel: 0,
            } as IFilter);
            expect(calls).toContainEqual({
                method: "eq",
                args: ["leveled_reader_level", 0],
            });
        });
    });

    describe("derivedFrom", () => {
        function instanceIdResolver(
            ids: Array<string | null>
        ): FakeQueryResolver {
            return (table, calls) => {
                if (
                    table === "books" &&
                    calls[0]?.args?.[0] === "book_instance_id"
                ) {
                    return {
                        data: ids.map((id) => ({ book_instance_id: id })),
                        error: null,
                    };
                }
                return { data: [], error: null, count: 0 };
            };
        }

        it("unions book_lineage_array over the sub-filter's instance ids, dropping nulls", async () => {
            const resolver = instanceIdResolver(["inst-1", "inst-2", null]);
            const { calls, client } = await runFilter(
                { derivedFrom: { topic: "Health" } as IFilter } as IFilter,
                resolver
            );

            const subQuery = client
                .queriesFor("books")
                .find((q) => q.calls[0]?.args?.[0] === "book_instance_id");
            expect(subQuery).toBeTruthy();
            // Run as an inner query: no default in_circulation/draft/base_url
            // guards, just the sub-filter's own topic constraint.
            expect(subQuery!.calls.slice(1)).toEqual([
                { method: "contains", args: ["tags", ["topic:Health"]] },
            ]);

            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                {
                    method: "overlaps",
                    args: ["book_lineage_array", ["inst-1", "inst-2"]],
                },
            ]);
        });

        it("fails closed (__no_match__) when the sub-filter matches no instance ids", async () => {
            const { calls } = await runFilter({
                derivedFrom: { topic: "Health" } as IFilter,
            } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                {
                    method: "overlaps",
                    args: ["book_lineage_array", ["__no_match__"]],
                },
            ]);
        });

        it("derivedFrom.otherTags excludes the parent collection via a negated tags.cs", async () => {
            const { calls } = await runFilter({
                derivedFrom: { otherTags: "bookshelf:Parent" } as IFilter,
            } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                {
                    method: "overlaps",
                    args: ["book_lineage_array", ["__no_match__"]],
                },
                {
                    method: "not",
                    args: ["tags", "cs", toArrayLiteral(["bookshelf:Parent"])],
                },
            ]);
        });

        it("derivedFrom.publisher excludes the parent publisher when otherTags is absent", async () => {
            const { calls } = await runFilter({
                derivedFrom: { publisher: "Acme" } as IFilter,
            } as IFilter);
            expect(calls).toContainEqual({
                method: "neq",
                args: ["publisher", "Acme"],
            });
            // Only the baseUrl guard's `.not("base_url", "is", null)` should
            // be present -- not the tags-exclusion `.not("tags", "cs", ...)`
            // that otherTags would have triggered instead.
            expect(calls).not.toContainEqual({
                method: "not",
                args: ["tags", "cs", expect.any(String)],
            });
        });

        it("derivedFrom.brandingProjectName excludes the parent branding when otherTags/publisher are absent", async () => {
            const { calls } = await runFilter({
                derivedFrom: { brandingProjectName: "Acme Brand" } as IFilter,
            } as IFilter);
            expect(calls).toContainEqual({
                method: "neq",
                args: ["branding_project_name", "Acme Brand"],
            });
        });

        it("otherTags takes precedence over publisher when both are set on derivedFrom", async () => {
            const { calls } = await runFilter({
                derivedFrom: {
                    otherTags: "bookshelf:Parent",
                    publisher: "Acme",
                } as IFilter,
            } as IFilter);
            expect(calls).toContainEqual({
                method: "not",
                args: ["tags", "cs", toArrayLiteral(["bookshelf:Parent"])],
            });
            expect(calls).not.toContainEqual({
                method: "neq",
                args: ["publisher", "Acme"],
            });
        });
    });

    describe("anyOfThese", () => {
        it("unions ids from each sub-filter and dedupes them", async () => {
            const resolver: FakeQueryResolver = (table, calls) => {
                if (table === "books" && calls[0]?.args?.[0] === "id") {
                    const isHealth = calls.some(
                        (c) =>
                            c.method === "contains" &&
                            JSON.stringify(c.args) ===
                                JSON.stringify(["tags", ["topic:Health"]])
                    );
                    return isHealth
                        ? {
                              data: [{ id: "book-1" }, { id: "book-2" }],
                              error: null,
                          }
                        : {
                              data: [{ id: "book-2" }, { id: "book-3" }],
                              error: null,
                          };
                }
                return { data: [], error: null, count: 0 };
            };

            const { calls, client } = await runFilter(
                {
                    anyOfThese: [
                        { topic: "Health" } as IFilter,
                        { topic: "Math" } as IFilter,
                    ],
                } as IFilter,
                resolver
            );

            const subQueries = client
                .queriesFor("books")
                .filter((q) => q.calls[0]?.args?.[0] === "id");
            expect(subQueries).toHaveLength(2);
            // Each sub-filter ran as an inner query (no default guards).
            subQueries.forEach((sq) => {
                expect(sq.calls.slice(1)).toEqual([
                    {
                        method: "contains",
                        args: ["tags", [expect.any(String)]],
                    },
                ]);
            });

            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "in", args: ["id", ["book-1", "book-2", "book-3"]] },
            ]);
        });

        it("fails closed (__no_match__) when no sub-filter matches anything", async () => {
            const { calls } = await runFilter({
                anyOfThese: [{ topic: "Health" } as IFilter],
            } as IFilter);
            expect(calls).toEqual([
                ...DEFAULT_GUARDS,
                { method: "in", args: ["id", ["__no_match__"]] },
            ]);
        });
    });
});

describe("applyOrdering", () => {
    function newQuery(): FakeQuery {
        const client = new FakeSupabaseClient();
        return client.from("books").select(MARKER_SELECT);
    }
    function callsAfterMarker(q: FakeQuery): RecordedCall[] {
        return q.calls.slice(1);
    }

    it("None leaves the query untouched and does not defer to client-side sorting", () => {
        const q = newQuery();
        const result = applyOrdering(q, BookOrderingScheme.None);
        expect(result.isClientSideOrdered).toBe(false);
        expect(callsAfterMarker(result.query as FakeQuery)).toEqual([]);
    });

    it("defaults to created_at desc when no scheme is passed", () => {
        const q = newQuery();
        const result = applyOrdering(q);
        expect(result.isClientSideOrdered).toBe(false);
        expect(callsAfterMarker(result.query as FakeQuery)).toEqual([
            { method: "order", args: ["created_at", { ascending: false }] },
        ]);
    });

    it("NewestCreationsFirst also orders by created_at desc", () => {
        const q = newQuery();
        const result = applyOrdering(
            q,
            BookOrderingScheme.NewestCreationsFirst
        );
        expect(result.isClientSideOrdered).toBe(false);
        expect(callsAfterMarker(result.query as FakeQuery)).toEqual([
            { method: "order", args: ["created_at", { ascending: false }] },
        ]);
    });

    it("LastUploadedFirst orders by last_uploaded desc with nulls last", () => {
        const q = newQuery();
        const result = applyOrdering(q, BookOrderingScheme.LastUploadedFirst);
        expect(result.isClientSideOrdered).toBe(false);
        expect(callsAfterMarker(result.query as FakeQuery)).toEqual([
            {
                method: "order",
                args: [
                    "last_uploaded",
                    { ascending: false, nullsFirst: false },
                ],
            },
        ]);
    });

    it("title-based schemes leave the query unordered and defer to client-side sorting/pagination", () => {
        for (const scheme of [
            BookOrderingScheme.TitleAlphabetical,
            BookOrderingScheme.TitleAlphaIgnoringNumbers,
        ]) {
            const q = newQuery();
            const result = applyOrdering(q, scheme);
            expect(result.isClientSideOrdered).toBe(true);
            expect(callsAfterMarker(result.query as FakeQuery)).toEqual([]);
        }
    });

    it("throws on an unhandled ordering scheme", () => {
        expect(() =>
            applyOrdering(newQuery(), "bogus-scheme" as BookOrderingScheme)
        ).toThrow("Unhandled book ordering scheme");
    });
});
