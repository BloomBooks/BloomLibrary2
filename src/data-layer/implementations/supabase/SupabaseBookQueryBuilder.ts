// Translates our backend-agnostic IFilter into Supabase/PostgREST filter
// calls, reproducing the semantics of constructParseBookQuery()
// (src/connection/BookQueryBuilder.ts) as closely as is practical against a
// relational schema. Divergences from the Parse behavior are called out in
// comments below; the notable ones (also listed in the PR description) are:
//   - Faceted search only understands: title:, uploader:, language:, feature:,
//     rebrand:, bookInstanceId:, level:. Other facets (copyright:, country:,
//     publisher:, originalPublisher:, edition:, branding(ProjectName):,
//     license:, phash:, bookHash:, harvestState:) are not translated and are
//     silently ignored (documented as a TODO below).
//   - Wildcard tag patterns (e.g. "bookshelf:X*", "*suffix") are not
//     translated to a Postgres pattern match; such tag conditions are
//     skipped rather than applied incorrectly.
//   - Unmatched (non-canonical) `topic` values, which Parse resolves with a
//     regex-OR across tag values, are skipped the same way.
//   - Free-text `search` terms use `.ilike()` against the precomputed
//     `search` column (AND of words), which has no relevance ranking, unlike
//     Mongo's $text/$score. Ordering falls back to created_at desc in that
//     case (see applyOrdering below).
import { SupabaseClient } from "@supabase/supabase-js";
import { BooleanOptions, IFilter, parseBooleanOptions } from "FilterTypes";
import { BookOrderingScheme } from "../../types/CommonTypes";
import { kTopicList } from "../../../model/ClosedVocabularies";
import { kTagForNoLanguage } from "../../../model/Language";
import {
    kNameOfNoTopicCollection,
    splitString,
} from "../../../connection/BookQueryBuilder";
import { Book } from "../../../model/Book";

// The postgrest-js builder's generic type narrows/changes shape across
// successive .eq()/.contains()/.filter() calls in ways that are painful to
// track through a long chain of conditionally-applied filters. This module
// is internal plumbing (not part of any public interface), so we use a loose
// alias rather than fight the generics.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SupabaseQuery = any;

interface TagRequirement {
    kind: "all" | "any" | "none";
    values: string[];
}

export interface BuildBookQueryOptions {
    // Mirrors Parse's simplifyInnerQuery(): when this filter is a sub-filter
    // of `anyOfThese` or `derivedFrom`, the default in_circulation/draft
    // guards only apply if the sub-filter explicitly set them, and the
    // baseUrl-not-null guard never applies.
    isInnerQuery?: boolean;
}

// PostgREST's .not() with an array operator (ov/cs) passes the value through
// verbatim, so it must already be a PostgreSQL array literal like
// {"topic:Health","topic:Math"} — unlike .overlaps()/.contains(), which
// serialize JS arrays themselves.
function toPostgresArrayLiteral(values: string[]): string {
    return (
        "{" +
        values.map((v) => '"' + v.replace(/(["\\])/g, "\\$1") + '"').join(",") +
        "}"
    );
}

function isWildcardTag(tag: string): boolean {
    return tag.startsWith("*") || tag.endsWith("*");
}

async function resolveLanguageIdsForIsoCode(
    client: SupabaseClient,
    isoCode: string
): Promise<string[]> {
    const { data, error } = await client
        .from("languages")
        .select("id")
        .eq("iso_code", isoCode);
    if (error) {
        console.error("Error resolving language iso code to id:", error);
        return [];
    }
    return (data ?? []).map((row: { id: string }) => row.id);
}

async function resolveUserIdsForEmailLike(
    client: SupabaseClient,
    emailPattern: string
): Promise<string[]> {
    const { data, error } = await client
        .from("users")
        .select("id")
        .ilike("email", `%${emailPattern}%`);
    if (error) {
        console.error("Error resolving uploader email to id:", error);
        return [];
    }
    return (data ?? []).map((row: { id: string }) => row.id);
}

// Applies the tri-state in_circulation/draft/rebrand guards and the
// baseUrl-not-null guard, honoring the inner-query relaxation described
// above.
function applyGuards(
    q: SupabaseQuery,
    f: IFilter,
    isInnerQuery: boolean
): SupabaseQuery {
    if (isInnerQuery) {
        if (f.inCirculation !== undefined) {
            switch (f.inCirculation) {
                case BooleanOptions.Yes:
                    q = q.eq("in_circulation", true);
                    break;
                case BooleanOptions.No:
                    q = q.eq("in_circulation", false);
                    break;
                case BooleanOptions.All:
                    break;
            }
        }
        if (f.draft !== undefined) {
            switch (f.draft) {
                case BooleanOptions.Yes:
                    q = q.eq("draft", true);
                    break;
                case BooleanOptions.No:
                    q = q.eq("draft", false);
                    break;
                case BooleanOptions.All:
                    break;
            }
        }
        // baseUrl guard is never applied to inner queries (matches
        // simplifyInnerQuery's unconditional `delete where.baseUrl`).
    } else {
        switch (f.inCirculation) {
            case undefined:
            case BooleanOptions.Yes:
                q = q.eq("in_circulation", true);
                break;
            case BooleanOptions.No:
                q = q.eq("in_circulation", false);
                break;
            case BooleanOptions.All:
                break;
        }
        switch (f.draft) {
            case BooleanOptions.Yes:
                q = q.eq("draft", true);
                break;
            case undefined:
            case BooleanOptions.No:
                q = q.eq("draft", false);
                break;
            case BooleanOptions.All:
                break;
        }
        q = q.not("base_url", "is", null);
    }

    // rebrand is not stripped for inner queries in Parse, so it always applies.
    switch (f.rebrand) {
        case BooleanOptions.Yes:
            q = q.eq("rebrand", true);
            break;
        case BooleanOptions.No:
            q = q.eq("rebrand", false);
            break;
        case BooleanOptions.All:
        case undefined:
            break;
    }

    return q;
}

function applyFeatureFilter(
    q: SupabaseQuery,
    featureValue: string
): SupabaseQuery {
    const features = featureValue.split(" OR ").map((s) => s.trim());
    if (features.length === 1) {
        if (features[0] === "activity") {
            return q.overlaps("features", ["activity", "quiz"]);
        }
        return q.contains("features", [features[0]]);
    }
    return q.overlaps("features", features);
}

function applyTagRequirements(
    q: SupabaseQuery,
    requirements: TagRequirement[]
): SupabaseQuery {
    for (const requirement of requirements) {
        const values = requirement.values.filter((v) => !isWildcardTag(v));
        if (values.length === 0) {
            continue; // Wildcard-only requirement; nothing safe to apply. See TODO above.
        }
        switch (requirement.kind) {
            case "all":
                for (const v of values) {
                    q = q.contains("tags", [v]);
                }
                break;
            case "any":
                q = q.overlaps("tags", values);
                break;
            case "none":
                // .not() does not serialize JS arrays the way .overlaps() does;
                // it needs a PostgreSQL array literal or the server rejects it
                // with "malformed array literal" (22P02).
                q = q.not("tags", "ov", toPostgresArrayLiteral(values));
                break;
        }
    }
    return q;
}

function buildTopicRequirements(topic: string): TagRequirement[] {
    const requirements: TagRequirement[] = [];
    const topicFilter = topic.trim();

    if (topicFilter.toLowerCase() === kNameOfNoTopicCollection.toLowerCase()) {
        requirements.push({
            kind: "none",
            values: kTopicList.map((t) => "topic:" + t),
        });
        return requirements;
    }

    const topicValues = topicFilter
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

    const canonicalTopicTags: string[] = [];
    const unmatchedTopics: string[] = [];

    topicValues.forEach((topicValue) => {
        const canonicalMatch = kTopicList.find(
            (t) => t.toLowerCase() === topicValue.toLowerCase()
        );
        if (canonicalMatch) {
            canonicalTopicTags.push(`topic:${canonicalMatch}`);
        } else {
            unmatchedTopics.push(topicValue);
        }
    });

    if (canonicalTopicTags.length > 0) {
        requirements.push({ kind: "all", values: canonicalTopicTags });
    }
    if (unmatchedTopics.length > 0) {
        // Parse resolves these via a regex-OR against tag values. There's no
        // simple per-element regex operator available through PostgREST, so
        // unmatched/non-canonical topic names are dropped. TODO: implement
        // via an RPC if this turns out to matter for the anon browsing paths.
        console.warn(
            `Supabase book query: ignoring unmatched topic value(s): ${unmatchedTopics.join(
                ", "
            )}`
        );
    }

    return requirements;
}

function buildLevelRequirements(levelValue: string): TagRequirement[] {
    if (levelValue === "empty") {
        return [
            {
                kind: "none",
                values: [
                    "level:1",
                    "level:2",
                    "level:3",
                    "level:4",
                    "computedLevel:1",
                    "computedLevel:2",
                    "computedLevel:3",
                    "computedLevel:4",
                ],
            },
        ];
    }
    const otherPrimaryLevels = [
        "level:1",
        "level:2",
        "level:3",
        "level:4",
    ].filter((x) => x.indexOf(levelValue) < 0);
    return [
        {
            kind: "any",
            values: ["computedLevel:" + levelValue, "level:" + levelValue],
        },
        { kind: "none", values: otherPrimaryLevels },
    ];
}

// NOTE: the return value is wrapped in a plain `{ query }` object rather than
// returned bare. postgrest-js query builders are thenable (calling `.then()`
// on one fires the HTTP request), and this function is itself `async`; if it
// did `return q` directly, the JS runtime would treat that thenable as this
// function's own resolution value and await it -- silently *executing* the
// query early and resolving to the response instead of the still-buildable
// query. Wrapping in a non-thenable object sidesteps that.
export interface BookFilterResult {
    query: SupabaseQuery;
}

/**
 * Applies an IFilter's conditions to a Supabase query builder for the
 * `books` table. Returns the (possibly reassigned) builder wrapped as
 * `{ query }`; callers must use `.query`, matching the
 * chainable-but-not-mutating postgrest-js convention.
 */
export async function applyBookFilter(
    client: SupabaseClient,
    query: SupabaseQuery,
    filter: IFilter | undefined,
    options: BuildBookQueryOptions = {}
): Promise<BookFilterResult> {
    const wf: IFilter = { ...(filter ?? {}) };
    let q = query;

    const tagRequirements: TagRequirement[] = [];
    const plainTags: string[] = [];

    if (wf.search) {
        // Passing [] for allTagsFromDatabase (Parse passes every real tag
        // name here so bare words matching a tag get treated as a tag
        // filter). v0 divergence: bare search words are never matched
        // against tag names, only against the facet-prefix list baked into
        // splitString() itself (title:, uploader:, etc).
        const { otherSearchTerms, specialParts } = splitString(wf.search, []);

        for (const part of specialParts) {
            const facetParts = part.split(":").map((p) => p.trim());
            const facetLabel = facetParts[0];
            const facetValue = facetParts[1];
            switch (facetLabel) {
                case "title":
                    q = q.ilike("title", `%${facetValue}%`);
                    break;
                case "uploader": {
                    const ids = await resolveUserIdsForEmailLike(
                        client,
                        facetValue
                    );
                    q = q.in(
                        "uploader_id",
                        ids.length > 0 ? ids : ["__no_match__"]
                    );
                    break;
                }
                case "feature":
                    q = applyFeatureFilter(q, facetValue);
                    break;
                case "rebrand":
                    wf.rebrand = parseBooleanOptions(facetValue);
                    break;
                case "language":
                    wf.language = facetValue;
                    break;
                case "bookInstanceId":
                    q = q.eq("book_instance_id", facetValue);
                    wf.draft = BooleanOptions.All;
                    wf.inCirculation = BooleanOptions.All;
                    break;
                case "level":
                    tagRequirements.push(...buildLevelRequirements(facetValue));
                    break;
                case "copyright":
                case "country":
                case "publisher":
                case "originalPublisher":
                case "edition":
                case "brandingProjectName":
                case "branding":
                case "license":
                case "phash":
                case "bookHash":
                case "harvestState":
                    // Recognized Parse facets, not yet translated to Supabase
                    // filters -- see module-level TODO. Skipped rather than
                    // treated as a literal tag (which would incorrectly
                    // require a tag like "country:US" that can't exist).
                    console.warn(
                        `Supabase book query: search facet "${facetLabel}:" is not yet supported, ignoring.`
                    );
                    break;
                default:
                    // Only reached for parts that aren't one of the facet
                    // labels above -- i.e. real tag names matched against
                    // allTagsFromDatabase. We currently pass an empty list to
                    // splitString() (see call site), so this is unreachable
                    // today, but kept for when that list gets wired up.
                    plainTags.push(part);
                    break;
            }
        }

        if (otherSearchTerms.length > 0) {
            for (const word of otherSearchTerms
                .split(" ")
                .filter((w) => w.length > 0)) {
                q = q.ilike("search", `%${word}%`);
            }
        }
    }

    q = applyGuards(q, wf, options.isInnerQuery === true);

    if (wf.language != null) {
        if (wf.language === kTagForNoLanguage) {
            q = q.filter("lang_pointers", "eq", "{}");
        } else {
            const languageIds = await resolveLanguageIdsForIsoCode(
                client,
                wf.language
            );
            q = q.overlaps(
                "lang_pointers",
                languageIds.length > 0 ? languageIds : ["__no_match__"]
            );
        }
    }

    if (wf.otherTags != null) {
        wf.otherTags.split(",").forEach((t) => plainTags.push(t.trim()));
    }

    if (wf.topic) {
        tagRequirements.push(...buildTopicRequirements(wf.topic));
    }

    if (plainTags.length > 0) {
        tagRequirements.push({ kind: "all", values: plainTags });
    }
    q = applyTagRequirements(q, tagRequirements);

    if (wf.feature != null) {
        q = applyFeatureFilter(q, wf.feature);
    }

    if (wf.keywordsText) {
        const [, keywordStems] = Book.getKeywordsAndStems(wf.keywordsText);
        q = q.contains("keyword_stems", keywordStems);
    }

    if (wf.publisher) {
        q = q.eq("publisher", wf.publisher);
    }
    if (wf.originalPublisher) {
        q = q.eq("original_publisher", wf.originalPublisher);
    }
    if (wf.edition) {
        q = q.eq("edition", wf.edition);
    }
    if (wf.brandingProjectName) {
        q = q.eq("branding_project_name", wf.brandingProjectName);
    }
    if (wf.bookInstanceId) {
        q = q.eq("book_instance_id", wf.bookInstanceId);
    }
    if (wf.leveledReaderLevel != null) {
        q = q.eq("leveled_reader_level", wf.leveledReaderLevel);
    }
    if (wf.originalCredits) {
        q = q.eq("credits", wf.originalCredits);
    }

    if (wf.derivedFrom) {
        const instanceIds = await getBookInstanceIdsMatchingFilter(
            client,
            wf.derivedFrom
        );
        q = q.overlaps(
            "book_lineage_array",
            instanceIds.length > 0 ? instanceIds : ["__no_match__"]
        );

        // Mirrors processDerivedFrom()'s nonParentFilter: excludes books that
        // are themselves part of the "parent" collection being derived from,
        // when that parent collection is identified simply enough to negate.
        if (wf.derivedFrom.otherTags) {
            // See the note on "none" tag requirements: .not() needs a literal.
            q = q.not(
                "tags",
                "cs",
                toPostgresArrayLiteral([wf.derivedFrom.otherTags])
            );
        } else if (wf.derivedFrom.publisher) {
            q = q.neq("publisher", wf.derivedFrom.publisher);
        } else if (wf.derivedFrom.brandingProjectName) {
            q = q.neq(
                "branding_project_name",
                wf.derivedFrom.brandingProjectName
            );
        }
    }

    if (wf.anyOfThese && wf.anyOfThese.length > 0) {
        const idSets = await Promise.all(
            wf.anyOfThese.map((sub) => getBookIdsMatchingFilter(client, sub))
        );
        const unionIds = Array.from(new Set(idSets.flat()));
        q = q.in("id", unionIds.length > 0 ? unionIds : ["__no_match__"]);
    }

    return { query: q };
}

// Runs `subFilter` as its own inner query (guards relaxed per
// simplifyInnerQuery semantics) and returns the matching book ids. Used by
// `anyOfThese`.
async function getBookIdsMatchingFilter(
    client: SupabaseClient,
    subFilter: IFilter
): Promise<string[]> {
    const initial = client.from("books").select("id");
    const { query: q } = await applyBookFilter(client, initial, subFilter, {
        isInnerQuery: true,
    });
    const { data, error } = await q;
    if (error) {
        console.error("Error running anyOfThese sub-filter:", error);
        return [];
    }
    return (data ?? []).map((row: { id: string }) => row.id);
}

// Same idea, but selects book_instance_id (used by `derivedFrom`).
async function getBookInstanceIdsMatchingFilter(
    client: SupabaseClient,
    subFilter: IFilter
): Promise<string[]> {
    const initial = client.from("books").select("book_instance_id");
    const { query: q } = await applyBookFilter(client, initial, subFilter, {
        isInnerQuery: true,
    });
    const { data, error } = await q;
    if (error) {
        console.error("Error running derivedFrom sub-filter:", error);
        return [];
    }
    return (data ?? [])
        .map((row: { book_instance_id: string | null }) => row.book_instance_id)
        .filter((id: string | null): id is string => !!id);
}

export interface OrderingResult {
    query: SupabaseQuery;
    // True when the caller should skip server-side pagination and instead
    // fetch (up to) all matching rows, leaving sorting/pagination to the
    // existing client-side doExpensiveClientSideSortingIfNeeded() path --
    // this mirrors Parse's configureQueryParamsForOrderingScheme() behavior
    // for the title-based ordering schemes.
    isClientSideOrdered: boolean;
}

export function applyOrdering(
    query: SupabaseQuery,
    orderingScheme: BookOrderingScheme = BookOrderingScheme.Default
): OrderingResult {
    switch (orderingScheme) {
        case BookOrderingScheme.None:
            return { query, isClientSideOrdered: false };
        case BookOrderingScheme.Default:
        case BookOrderingScheme.NewestCreationsFirst:
            return {
                query: query.order("created_at", { ascending: false }),
                isClientSideOrdered: false,
            };
        case BookOrderingScheme.LastUploadedFirst:
            return {
                query: query.order("last_uploaded", {
                    ascending: false,
                    nullsFirst: false,
                }),
                isClientSideOrdered: false,
            };
        case BookOrderingScheme.TitleAlphabetical:
        case BookOrderingScheme.TitleAlphaIgnoringNumbers:
            return { query, isClientSideOrdered: true };
        default:
            throw new Error("Unhandled book ordering scheme");
    }
}
