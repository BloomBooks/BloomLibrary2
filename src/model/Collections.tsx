import { useContext } from "react";
import { getDisplayNamesFromLanguageCode, ILanguage } from "./Language";
import { CachedTablesContext } from "./CacheProvider";
import { ICollection, IRawCollection } from "./ContentInterfaces";
import { convertContentfulCollectionToICollection } from "./Contentful";
import { kTopicList } from "./ClosedVocabularies";
import { useContentful } from "../connection/UseContentful";
import { useGetLoggedInUser } from "../connection/LoggedInUser";
import { BooleanOptions, IFilter } from "FilterTypes";
import { IntlShape, useIntl } from "react-intl";
import { getLocalizedCollectionLabel } from "../localization/CollectionLabel";
import { appHostedSegment } from "../components/appHosted/AppHostedUtils";
import { generateCollectionFromFilters } from "../components/CollectionSubsetPage";
import { isFacetedSearchString } from "../connection/LibraryQueryHooks";
import { getContextLangTagFromLanguageSegment } from "../components/Routes";

/* From original design: Each collection has
    id
    label
    child collections [ 0  or more ] (potentially ordered?)
    book query (optional)
    pageType (optional)
    banner specification (optional)
    card icon (optional)
    A (potentially ordered) set of books ←- this comes from Parse, not Contentful

    Banner
        ID
        Background Image (optional) We use the “card icon” if this is missing (e.g. all publishers)
        Image Credits
        Description
*/

interface IContentfulCollectionQueryResponse {
    collection?: ICollection;
    loading: boolean; // Hook response loading || !fetched, that is, we don't actually have a result yet
}

// A hook function for retrieving all the collections from contentful.
// This is increasingly time-consuming, but might be worth reinstating as something we do in the
// background. OTOH, user may still be paying to download stuff he won't need (and more than
// half of which we have already).
// function useGetContentfulCollections(): IRawCollection[] {
//     // Get every collection in Contentful

//     const { loading, result } = useContentful({
//         content_type: "collection",
//         // Only fetch the fields we need. Unfortunately most of the fields we define are used somewhere; we could conceivably fetch fewer
//         // for certain purposes. We don't directly use sys.type and sys.key, but they are needed to make the contentful code
//         // that builds the childCollections array work properly. There appears to be no way to avoid unwanted fields in referenced objects
//         // (about half the total data this fetches).
//         // As of Jan 2021, we save about 17% by restricting fields this way. Replacing all the fields.* items with just "fields"
//         // is also worth considering...we save 16% just by cutting out unused sys fields.
//         select:
//             "fields.bookSortOrder,fields.banner,fields.urlKey,fields.iconForCardAndDefaultBanner,fields.filter,fields.label,fields.richTextLabel,fields.description,fields.statisticsQuerySpec,fields.hideLabelOnCardAndDefaultBanner,fields.childCollections,fields.layout,fields.rows,sys.contentType,sys.id,sys.type",
//         include: 10, // depth
//     });
//     if (loading) {
//         return [];
//     }
//     return result as IRawCollection[];
// }

// Get the specified contentful collection. CollectionName may be falsy for various
// reasons, mostly to do with the fact that as a hook we are forced to call this in
// cases where we know we don't want to. In that case, return loading:true result:[]
// without doing an actual query.
function useGetContentfulCollection(
    collectionName?: string
): {
    loading: boolean;
    result: IRawCollection[];
} {
    const nameParts = (collectionName || "").split(":");
    let templateKey = "-";
    if (nameParts.length > 1) {
        templateKey = `[Template ${Capitalize(nameParts[0])} Collection]`;
    }

    const { loading, result } = useContentful(
        collectionName
            ? {
                  content_type: "collection",
                  // Only fetch the fields we need. Unfortunately most of the fields we define are used somewhere; we could conceivably fetch fewer
                  // for certain purposes. We don't directly use sys.type and sys.key, but they are needed to make the contentful code
                  // that builds the childCollections array work properly. There appears to be no way to avoid unwanted fields in referenced objects
                  // (about half the total data this fetches).
                  // As of Jan 2021, we save about 17% by restricting fields this way. Replacing all the fields.* items with just "fields"
                  // is also worth considering...we save 16% just by cutting out unused sys fields.
                  select:
                      "fields.bookSortOrder,fields.banner,fields.urlKey,fields.iconForCardAndDefaultBanner,fields.sponsorshipImage,fields.filter,fields.label,fields.richTextLabel,fields.description,fields.urlForBloomPubBundle,fields.urlForAlphaTiles,fields.urlForBloomSourceBundle,fields.statisticsQuerySpec,fields.hideLabelOnCardAndDefaultBanner,fields.childCollections,fields.expandChildCollectionRows,fields.layout,fields.rows,fields.useSimpleBookshelfFilter,fields.country,sys.contentType,sys.id,sys.type",
                  include: 10, // depth
                  "fields.urlKey[in]": `${collectionName},${templateKey}`,
              }
            : undefined // no collection name means we don't want useContentful to do a query
    );
    if (loading) {
        return { loading, result: [] };
    }
    return { loading, result: result as IRawCollection[] };
}

// Basically a map of collectionName to ICollection
const collectionCache: any = {};

// A hook function for working with collections, generally retrieved from contentful.
// If `collections` or `languages` is not yet populated,
// it will return a result with loading true and the collection undefined.
// When the query is complete a state change will cause it to be called again and return a useful result.
// In some cases, if a collection is not found on contentful, it is generated by code here.
// If collectionName is falsy, returns a result with loading:false and no other data.
export function useGetCollection(
    collectionName?: string,
    filters?: string[]
): IContentfulCollectionQueryResponse {
    const l10n = useIntl();
    const cachedCollection = collectionName
        ? collectionCache[collectionName]
        : undefined;
    // If we got a result from the cache, we don't need to do a fresh query...
    // but it's a hook so we have to call it. Passing an empty collectionName
    // will cause it to do minimal work, certainly not a network query.
    const { loading, result: collections } = useGetContentfulCollection(
        cachedCollection ? "" : collectionName
    );
    const { languagesByBookCount: languages } = useContext(CachedTablesContext);
    const user = useGetLoggedInUser(); // for collection 'my-books'

    if (cachedCollection) {
        const filteredCollection = applyFilters(
            cachedCollection,
            filters,
            l10n
        );
        return { loading: false, collection: filteredCollection };
    }

    if (!collectionName) {
        return { loading: false };
    }

    if (loading) {
        return { loading };
    }

    if (!user && collectionName === "my-books") {
        // There must be a logged in user for the 'my-books' option to be available.
        // But we can get here if the 'useGetLoggedInUser()' call hasn't returned yet.
        return { loading: true };
    }

    if (!collections.length) {
        console.error("collection " + collectionName + " not found");
        return { loading: false, collection: undefined };
    }

    // We have template collections for everything, and then also we can provide
    // override collections for any value. E.g. our query will first look for a
    // collection named "Language:en", but then if that is not found, it will
    // return "[Template Language Collection]".
    const nameParts = collectionName.split(":");
    let templateKey = "-";
    if (nameParts.length > 1) {
        templateKey = `[Template ${Capitalize(nameParts[0])} Collection]`;
    }

    let templateFacetCollection: ICollection | undefined;
    let explicitCollection: ICollection | undefined;

    collections.forEach((item: IRawCollection) => {
        if (item.fields.urlKey === templateKey) {
            templateFacetCollection = convertContentfulCollectionToICollection(
                item
            );
        } else if (item.fields.urlKey === collectionName) {
            explicitCollection = convertContentfulCollectionToICollection(item);
        }
    });
    // console.log(`nameparts = ${JSON.stringify(nameParts)}`);
    // console.log(`collections=${JSON.stringify(collections)}`);
    console.assert(
        templateFacetCollection || nameParts.length === 1,
        `If it's a facetted collection, we should have a template for it. nameparts = ${JSON.stringify(
            nameParts
        )}  `
    );

    let collection: ICollection | undefined;
    if (templateFacetCollection) {
        if (languages.length === 0) {
            return { loading: true };
        }
        collection = getFacetCollection(
            nameParts[0],
            nameParts[1],
            templateFacetCollection,
            explicitCollection, // may or may not be defined
            languages,
            l10n
        );
    } else if (explicitCollection) {
        // I don't think we'll ever first see this except as a root. If we do, may need to figure
        // a way to move it to cacheChildCollections
        if (explicitCollection.urlKey === "my-books") {
            if (user) {
                const email = user.email;
                if (email) {
                    const filterOnUserAsUploader: IFilter = {};
                    filterOnUserAsUploader.search = `uploader:${email}`;
                    filterOnUserAsUploader.draft = BooleanOptions.All;
                    filterOnUserAsUploader.inCirculation = BooleanOptions.All;
                    explicitCollection.filter = filterOnUserAsUploader;
                }
            }
        }
        collection = explicitCollection;
    }

    if (collection) {
        // e.g. https://bloomlibrary.org/language:zh-CN should have context language zh-CN
        collection.contextLangTag = getContextLangTagFromLanguageSegment(
            collection.urlKey
        );

        // Cache the raw collections from Contentful, before any custom filters are applied to it
        // 1) What the cache is doing for is saving us from retrieving collection definitions from contentful.
        //    The custom filters are irrelevant to that stage, so they need not be included in the cache key
        // 2) The work of adding the filters to the raw collection is minor, so not caching it is no big deal
        // 3) Higher cache hit ratios with the unfiltered collections/children than the filtered ones
        // 4) Simpler code
        collectionCache[collectionName] = collection;
        // Commonly, especially when we load the root collection for the page,
        // we'll get lots of other collections linked as children. We can save time
        // later by caching them too.
        cacheChildCollections(collection);

        // Handle faceted searches handled by filters
        collection = applyFilters(collection, filters, l10n);

        return { loading: false, collection };
    }

    return { loading: false };
}

/**
 * Given a collection definition from Contentful, applies custom filters (if relevant) and returns a filtered collection definition
 */
function applyFilters(
    collection: ICollection,
    filters: string[] | undefined,
    l10n: IntlShape
) {
    if (!filters || filters.length <= 0) {
        return collection;
    }
    return generateCollectionFromFilters(collection, filters, l10n)
        .filteredCollection;
}

// Enhance: this might miss caching some collections that we would find by templatekey?
function cacheChildCollections(collection: ICollection) {
    if (collection.urlKey === "topics") {
        // We currently generate the one collection for each topic, just
        // for showing the cards. If someone clicks a card, well then we
        // go and see what the collection should really be. If we ever
        // want to use icons on the card, then we can just remove this
        // whole block and instead populate the "Topics" collection on
        // Contentful
        collection.childCollections = makeTopicCollectionsForCards();
        // Do NOT cache the child collections we just made, we want to go to
        // contentful to see if there's a real one if we ever open it.
    } else {
        collection.childCollections.forEach((c) => {
            if (!collectionCache[c.urlKey]) {
                collectionCache[c.urlKey] = c;
                cacheChildCollections(c);
            }
        });
    }
}

function getFacetCollection(
    facet: string,
    value: string,
    templateCollection: ICollection,
    explicitCollection: ICollection | undefined,
    languages: ILanguage[],
    l10n: IntlShape
): ICollection {
    /* --- ENHANCE: Currently if we have a leading colon, e.g. bloomlibrary.org/:keyword:foo, we won't get to use the
    "[Template Keyword Collection]", nor the actual "keyword:foo" collection from CF, if it exists.
    This is because the leading colon triggers the CollectionSubsetPage, which only creates and applies a filter to
    the root collection. */

    switch (facet) {
        case "language":
            // language collections are optionally generated. We can make real cards if we
            // want, to give a more interesting background image etc, but if we don't have
            // one for a language, we generate a default here.
            // We currently don't need to mess with the actual content of the languages
            // collection because a special case in CollectionPage for the language-chooser urlKey
            // creates a special LanguageGroup row, which determines the children directly
            // from the main database.
            return makeLanguageCollection(
                templateCollection,
                explicitCollection,
                value,
                languages
            );

        case "topic":
            // topic collections currently are generated from the fixed list above.
            // the master "topics" collection is real (so it can be included at the
            // right place in its parent) but its children are inserted by another special case.
            return makeTopicCollection(
                templateCollection,
                explicitCollection,
                value
            );

        // case "keyword":
        //     collection = makeVirtualCollectionForKeyword(collection, value);
        //     return { collection, loading: false };

        case "search":
            // search collections are generated from a search string the user typed.
            return makeVirtualCollectionForSearch(
                templateCollection,
                value,
                l10n
            );

        case "phash":
        case "bookHash":
            return makeVirtualCollectionForHash(
                templateCollection,
                facet,
                value
            );

        default:
            throw Error(`Unknown facet: ${facet}`);
    }
}

// If we don't find a contentful collection for language:xx, we create one.
export function makeLanguageCollection(
    templateCollection: ICollection,
    explicitCollection: ICollection | undefined,
    langCode: string,
    languages: ILanguage[]
): ICollection {
    const appHostedMode = window.location.pathname.startsWith(
        "/" + appHostedSegment
    );
    const languageNames = getDisplayNamesFromLanguageCode(langCode!, languages);
    // In app-hosted mode, we're probably on a phone screen, and space is at a premium,
    // especially in the app navbar which is one place we end up using the collection label.
    // Also, we're expecting that the user has selected his own language and is probably
    // comfortable with the autonymn. So just use that.
    // It's slighly unfortunate that to get this effect we have to ignore any label in
    // contentful, but those are pretty consistently primary (secondary) or just primary.
    let languageDisplayName = appHostedMode
        ? languageNames?.secondary || languageNames?.primary
        : languageNames?.combined;
    if (!languageDisplayName) languageDisplayName = langCode;

    // We need the label in [Template Language Collection] to be $1.
    // Then we allow an explicit collection to define its own label, else we
    // need it to have "$1" in the label.

    let label = languageDisplayName;
    if (!appHostedMode) {
        label = explicitCollection?.label
            ? explicitCollection.label.replace("$1", languageDisplayName)
            : templateCollection.label.replace("$1", languageDisplayName);
        // if we still don't have anything
        label = label || languageDisplayName;
    }
    return {
        // last wins
        ...templateCollection,
        ...explicitCollection,
        urlKey: "language:" + langCode,
        filter: { ...templateCollection.filter, language: langCode },
        label,
        title: `Free ${languageDisplayName} books`,
        metaDescription: `A collection of free books in the ${languageDisplayName} language.`,
    };
}

export function makeTopicCollection(
    templateCollection: ICollection,
    explicitCollection: ICollection | undefined,
    topicName: string
): ICollection {
    // last wins
    return {
        iconForCardAndDefaultBanner: {
            url: "none",
            altText: "none",
            credits: "none",
        },
        ...templateCollection,
        ...explicitCollection,
        urlKey: "topic:" + topicName,
        label: templateCollection.label.replace("$1", topicName) || topicName,
        filter: { ...templateCollection.filter, topic: topicName },
    };
}

export function makeVirtualCollectionForSearch(
    templateCollection: ICollection,
    search: string,
    l10n: IntlShape,
    baseCollection?: ICollection
): ICollection {
    const searchContent = search.startsWith("deeper:")
        ? search.substring("deeper:".length)
        : isFacetedSearchString(search)
        ? search
        : 'title:"' + search + '"';
    const filter = { ...baseCollection?.filter, search: searchContent };
    let label = l10n.formatMessage(
        {
            id: "search.booksMatching",
            defaultMessage: 'Books matching "{searchTerms}"',
        },
        { searchTerms: decodeURIComponent(search) }
    );
    // The root.read is a special case that is always unmarked...not including
    // it's label allows us to, for example, see "Bloom Library: Books matching dogs"
    // rather than "Bloom Library: Read - Books matching dogs"
    if (baseCollection?.urlKey !== "root.read" && baseCollection?.label) {
        const localizedBaseCollectionLabel = getLocalizedCollectionLabel(
            baseCollection
        );
        label = `${localizedBaseCollectionLabel} - ${label}`;
    }
    let urlKey = ":search:" + encodeURIComponent(search);
    if (baseCollection?.urlKey) {
        urlKey = baseCollection.urlKey + "/" + urlKey;
    }
    // Enhance: how can we modify title to indicate that it's restricted to books matching a search,
    // given that it's some unknown contentful representation of a rich text?
    const result: ICollection = {
        ...templateCollection,
        ...baseCollection,
        filter,
        label,
        urlKey,
    };
    return result;
}

export function makeVirtualCollectionForHash(
    templateCollection: ICollection,
    facet: string,
    value: string
): ICollection {
    // review: would it be cleaner to make phash or bookHash a top-level field in filter?
    // Would require changes to the LibraryQueryHooks function for interpreting
    // filter. It's also remotely possible that losing the ability to type
    // a phash: or bookHash: into the search box would be missed.
    const filter = { search: `${facet}:${value}` };
    const urlKey = `${facet}:${value}`;
    const result: ICollection = {
        ...templateCollection,
        filter,
        urlKey,
        urlKeyToUseForLabelL10n: templateCollection.urlKey,
        childCollections: [],
    };
    return result;
}

export function getDummyCollectionForPreview(bannerId: string): ICollection {
    return {
        contentfulId: undefined, // this is made up here: it's not from contentful
        label: "dummy",
        title: "dummy",
        metaDescription: "dummy",
        urlKey: "dummy",
        filter: {},
        childCollections: [],
        bannerId,
        iconForCardAndDefaultBanner: undefined,
        layout: "by-level",
        rawLayout: "by-level",
        type: "collection",
        description: "",
        urlForBloomPubBundle: "",
        urlForBloomSourceBundle: "",
        urlForAlphaTiles: "",
        expandChildCollectionRows: false,
        showBookCountInRowDisplay: false,
    };
}
// These are just for cards. At this point it would not be possible to override what we see on a topic
// card. But once you click the card, then you're going to topic:foo and we would pick up any explicit
// "topic:foo" collection.
function makeTopicCollectionsForCards(): ICollection[] {
    return [...kTopicList].sort().map((t) =>
        makeTopicCollection(
            {
                contentfulId: undefined, // this is made up here: it's not from contentful
                urlKey: "topic:" + t,
                label: t,
                title: `Free ${t} books`,
                metaDescription: `Free books about ${t}.`,
                childCollections: [],
                filter: { rebrand: BooleanOptions.No, topic: t }, // topics don't want to show rebranded books (BL-10899)
                bannerId: "", // this will never be used because it's just for the card
                layout: "by-level", // this will never be used because it's just for the card
                rawLayout: "by-level",
                type: "collection",
                description: "",
                urlForBloomPubBundle: "",
                urlForBloomSourceBundle: "",
                urlForAlphaTiles: "",
                expandChildCollectionRows: false,
                showBookCountInRowDisplay: false,
            },
            undefined,
            t
        )
    );
}

/* We're thinking (but not certain) that we just want to treat keyword lookups as searches (which will of course
    find books that have this explicit keyword *

    export function makeVirtualCollectionForKeyword(
    templateCollection: ICollection,
    keyword: string,
    baseCollection?: ICollection
): ICollection {
    const filter: IFilter = {
        ...baseCollection?.filter,
        keywordsText: keyword,
    };
    let label = "Books with keyword " + keyword;
    if (baseCollection?.label) {
        label = baseCollection.label + " - " + label;
    }

    let urlKey = "keyword:" + keyword;
    if (baseCollection?.urlKey) {
        urlKey = baseCollection.urlKey + "/" + urlKey;
    }
    // Enhance: how can we append "- keyword" to title, given that it's some unknown
    // contentful representation of a rich text?
    return {
        ...templateCollection,
        ...baseCollection,
        filter,
        label,
        urlKey,
        childCollections: [],
        iconForCardAndDefaultBanner: undefined,
    };
}*/

function Capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function getFilterForCollectionAndChildren(collection: ICollection) {
    if (!collection) return undefined;
    const filters: IFilter[] = [];
    gatherCollectionAndChildrenFilters(collection, filters);
    const filter: IFilter = {
        anyOfThese: filters,
    };
    return filter;
}

// Accumulate the filters for this collection and recursively all of
// its child collections into the supplied IFilter[] array.
function gatherCollectionAndChildrenFilters(
    collection: ICollection | undefined,
    filters: IFilter[]
): void {
    if (!collection) return;
    if (collection.filter) {
        filters.push(collection.filter);
    }
    for (const mychild of collection.childCollections) {
        gatherCollectionAndChildrenFilters(mychild, filters);
    }
}
