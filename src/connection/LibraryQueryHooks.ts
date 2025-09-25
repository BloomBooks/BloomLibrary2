import useAxios, { IReturns, axios, IParams } from "@use-hooks/axios";
import { AxiosResponse } from "axios";
import { IFilter, BooleanOptions, parseBooleanOptions } from "../IFilter";
import { getConnection } from "./ParseServerConnection";
import {
    getBloomApiBooksUrl,
    getBloomApiUrl,
    getBloomApiHeaders,
} from "./ApiConnection";
import { retrieveBookData } from "./LibraryQueries";
    return stats;
}

// we just want a better name
export interface IAxiosAnswer extends IReturns<any> {}

// May set param.order to "auto-sort-order" to indicate that books should be
// sorted by title unless the search is a keyword search that makes a ranking
// score available. For this to work, params must also specify keys.
function useBookQueryInternal(
    params: {}, // this is the order, which fields, limits, etc.

    filter: IFilter, // this is *which* records to return
    orderingScheme?: BookOrderingScheme,
    limit?: number, //pagination
    skip?: number, //pagination
    doNotActuallyRunQuery?: boolean
): IAxiosAnswer {
    const { tags } = useContext(CachedTablesContext);

    const collectionReady = useProcessDerivativeFilter(filter);
    const axiosParams = makeBookQueryAxiosParams(
        params,
        filter,
        orderingScheme,
        limit,
        skip,
        doNotActuallyRunQuery || !collectionReady,
        tags
    );

    return useAxios(axiosParams);
}

// Convert from derivedFromCollectionName to derivedFrom.
// We have to do this as a hook because the collection information is available to us via hook.
// The logic here is much complicated by the rules of hooks which state hooks must be called unconditionally.
//
// returns true if either we have retrieved the needed filter from the collection named in filter.derivedFromCollectionName,
//  or we do not need to retrieve it because none is named.
export function useProcessDerivativeFilter(filter: IFilter): boolean {
    const collectionName = filter?.derivedFromCollectionName || "";
    const { collection: derivedFromCollection, loading } = useGetCollection(
        collectionName
    );
    if (!collectionName) return true;
    if (loading) return false;
    if (!filter.derivedFrom) {
        filter.derivedFrom = derivedFromCollection?.filter;
    }
    delete filter.derivedFromCollectionName;
    return true;
}

// Creates a partial Axios params object with the url and connection headers filled in.
// The caller is responsible for filling out the rest of the object.
function makeBookQueryAxiosParams(
    params: {}, // this is the order, which fields, limits, etc.
    filter: IFilter, // this is *which* records to return
    orderingScheme?: BookOrderingScheme,
    limit?: number, //pagination
    skip?: number, //pagination
    doNotActuallyRunQuery?: boolean,
    tags?: string[]
): IParams<any> {
    // Parse server's default limit is 100, which is basically never helpful to us.
    // There is a corner case in useCollectionStats for which we currently want 0. See BL-10126.
    // Note, if we ever change this to get all books, be sure to set inCirculation appropriately.
    const defaultLimit = 0;

    let finalParams: object = { where: {}, limit: defaultLimit };
    // No reason to construct the query if we aren't going to run it...
    if (!doNotActuallyRunQuery) {
        finalParams = constructParseBookQuery(
            params,
            filter,
            tags || [],
            orderingScheme,
            limit,
            skip
        );
    }
    //console.log("finalParams: " + JSON.stringify(finalParams));

    return {
        url: `${getConnection().url}classes/books`,
        // The "rules of hooks" require that if we're ever going to run a useEffect, we have to *always* run it
        // So we can't conditionally run this useBookQueryInternal(). But useAxios does give this way to run its
        // internal useEffect() but not actually run the query.
        forceDispatchEffect: () => !doNotActuallyRunQuery,
        // See comment below on `options.data`.
        method: "POST",
        // there is an inner useEffect, and it looks at this. We want to rerun whenever the query changes (duh).
        // Also, the very first time this runs, we will need to run again once we get
        // the list of known tags.
        trigger:
            JSON.stringify(params) +
            JSON.stringify(filter) +
            JSON.stringify(!!tags) +
            JSON.stringify(limit) +
            JSON.stringify(skip),
        options: {
            headers: getConnection().headers,
            // The filter may be too complex to pass in the URL (ie, GET params).  So we use POST with data that
            // specifies that the underlying operation is actually a GET.  (This doesn't seem to be documented, but
            // Andrew discovered that it works, and I got a confirming message on the parse-server slack channel.)
            data: {
                _method: "GET",
                ...finalParams,
            },
            params: undefined as any,
        },
    };
}

// export function useBookQuery(
//     params: {},
//     filter: IFilter,
//     limit?: number, //pagination
//     skip?: number //pagination
// ): IBasicBookInfo[] {
//     const bookResultsStatus: IAxiosAnswer = useBookQueryInternal(
//         params,
//         filter,
//         limit,
//         skip
//     );
//     const simplifiedResultStatus = processAxiosStatus(bookResultsStatus);

//     return simplifiedResultStatus.books.map((rawFromREST: any) => {
//         const b: IBasicBookInfo = { ...rawFromREST };
//         b.languages = rawFromREST.langPointers;
//         return b;
//     });
// }

// Note that we also have a full-fledge "book" class, so why aren't we just using that?
// Book class, used in the BookDetail screen, is basically everything we might want to
// know about a book, and is more expensive to get and prepare. In contrast, this is just some type wrapping
// around the raw REST result, used to quickly make book cards & grid rows.
export interface IBasicBookInfo {
    objectId: string;
    baseUrl: string;
    harvestState?: string;
    //note, here in a "BasicBookInfo", this is just JSON, intentionally not parsed yet,
    // in case we don't need it.
    allTitles: string;
    // conceptually a date, but uploaded from parse server this is what it has.
    harvestStartedAt?: { iso: string } | undefined;
    title: string;
    languages: ILanguage[];
    features: string[];
    tags: string[];
    updatedAt?: string;
    // conceptually a date, but uploaded from parse server this is what it has.
    lastUploaded?: { iso: string } | undefined;
    license: string;
    copyright: string;
    pageCount: string;
    createdAt: string;
    country?: string;
    phashOfFirstContentImage?: string;
    bookHashFromImages?: string;
    edition: string;
    draft?: boolean;
    inCirculation?: boolean;
    score?: number;
    lang1Tag?: string;
    show?: { pdf: { langTag: string } }; // there is more, but this is what we're using to get at l1 at the moment

    // wouldBeRemoved is used for the troubleshooting view where we display semi-transparent version
    // of the cards that would be removed, if we weren't in troubleshooting mode.
    wouldBeRemoved?: boolean;
    // show the book as a stack of books
    showStacked?: boolean;
}

const kFieldsOfIBasicBookInfo =
    "title,baseUrl,objectId,langPointers,tags,features,lastUploaded,harvestState,harvestStartedAt,pageCount,phashOfFirstContentImage,bookHashFromImages,allTitles,edition,draft,rebrand,inCirculation,show";

// uses the human "level:" tag if present, otherwise falls back to computedLevel
export function getBestLevelStringOrEmpty(basicBookInfo: IBasicBookInfo) {
    const levelValue = getTagStringOrEmpty(basicBookInfo, "level");
    if (levelValue) return levelValue;
    return getTagStringOrEmpty(basicBookInfo, "computedLevel");
}
export function getTagStringOrEmpty(
    basicBookInfo: IBasicBookInfo,
    tag: string
): string {
    const tagWithValue = basicBookInfo.tags
        ? basicBookInfo.tags.filter((t) => t.startsWith(tag + ":"))[0]
        : undefined;
    return tagWithValue ? tagWithValue.split(":")[1]?.trim() : "";
}

export interface ISearchBooksResult {
    waiting: boolean;
    totalMatchingRecords: number;
    errorString: string | null;
    books: IBasicBookInfo[];
}
export interface IBookshelfResult {
    objectId: string;
    englishName: string;
    normallyVisible: boolean;
    category: string;
    key: string;
}
interface ISimplifiedAxiosResult {
    waiting: boolean;
    count: number;
    error: Error | null;
    books: IBasicBookInfo[];
}

// the idea is for this to be higher level than useQueryLibrary. Initially
// with a separate count for the full number, but eventually with paging.
// May set param.order to "auto-sort-order" to indicate that books should be
// sorted by title unless the search is a keyword search that makes a ranking
// score available. For this to work, params must also specify keys.
//
// NOTE: callers are welcome to include `keys` in the `params`, which will
// override what we have here, if they really
// only want a subset of IBasicBookInfo, but realize that this is usually not
// worth the added complexity. By default, this function should just fully
// populate the IBasicBookInfo.
// Remember to specify limit if you don't want the default first 100 matching books!
export function useSearchBooks(
    params: {}, // this is the order, which fields, limits, etc.
    filter: IFilter, // this is *which* books to return
    orderingScheme?: BookOrderingScheme,
    languageForSorting?: string,
    doNotActuallyRunQuery?: boolean
): ISearchBooksResult {
    const fullParams = {
        count: 1,
        keys:
            // this should be all the fields of IBasicBookInfo
            kFieldsOfIBasicBookInfo,
        ...params,
    };
    const bookResultsStatus: IAxiosAnswer = useBookQueryInternal(
        fullParams,
        filter,
        orderingScheme,
        undefined,
        undefined,
        doNotActuallyRunQuery
    );
    const simplifiedResultStatus = processAxiosStatus(bookResultsStatus);

    // This useMemo is more important than it looks. It can prevent essentially endless loops that
    // arise like this:
    // A client sets some state in a useEffect that depends on the 'books' returned as part of
    // the result of this function.
    // So, initially, the client renders. The useEffect runs once. It sets the state.
    // This is a change, so render runs again. It calls this function again, as render always will.
    // Each such call returns a NEW object, not equal to the previous object, even though
    // it is equivalent, since nothing has changed that would cause useBookQueryInternal
    // to return different results or run the parse query again. That's OK, we just depended on
    // the books.
    // But, without this memo, we get a NEW typeSafeBooksRecord on each call, not equal to
    // the books we returned last time. The client's useEffect sees a different book list.
    // It runs the useEffect again. It calls setState, which causes another render,...
    // and so it continues!
    // With the memo, unless something significant changes, the books value that this function
    // returns is the actual same object on every call.
    // (Actually this isn't guaranteed by the useMemo contract...occasionally it might
    // discard and rebuild the memo cache...but it will be true enough of the time to prevent
    // significant wasted work.)
    const typeSafeBookRecords: IBasicBookInfo[] = useMemo(() => {
        if (!simplifiedResultStatus.books.length) return [];
        const books = simplifiedResultStatus.books.map((rawFromREST: any) => {
            const b: IBasicBookInfo = { ...rawFromREST };
            b.languages = rawFromREST.langPointers;
            b.lang1Tag = b.show?.pdf?.langTag;
            Book.sanitizeFeaturesArray(b.features);
            return b;
        });

        //https://issues.bloomlibrary.org/youtrack/issue/BL-11137#focus=Comments-102-43829.0-0
        return doExpensiveClientSideSortingIfNeeded(
            books,
            orderingScheme,
            languageForSorting
        ) as IBasicBookInfo[];
    }, [simplifiedResultStatus.books, orderingScheme, languageForSorting]);

    return {
        totalMatchingRecords: simplifiedResultStatus.count,
        errorString: simplifiedResultStatus.error
            ? simplifiedResultStatus.error.message
            : null,
        books: typeSafeBookRecords,
        waiting: simplifiedResultStatus.waiting,
    };
}

// Sends a request to get the stats for all books matching the filters
export function useCollectionStats(
    statsProps: IStatsPageProps,
    urlSuffix: string
): IAxiosAnswer {
    const collectionFilter = statsProps.collection.filter
        ? statsProps.collection.filter
        : getFilterForCollectionAndChildren(statsProps.collection);
    const collectionReady = useProcessDerivativeFilter(
        collectionFilter as IFilter
    );

    let apiFilter: any;
    if (!statsProps.collection.statisticsQuerySpec) {
        const params = {
            // These are the specific keys we want parse to look up and provide to postgresql
            keys: "objectId,bookInstanceId",
        };
        const limit = 1000000; // default is 100
        const skip = undefined;
        // If we don't have a filter, typically because we had to call the hook before
        // conditional logic testing for whether we had already retrieved a collection
        // from which we could get the filter, there's no point in actually running
        // the query. useAxios will just immediately return no results.
        const doNotRunQuery: boolean = !collectionFilter;
        const bookQueryParams = makeBookQueryAxiosParams(
            params,
            collectionFilter || {},
            BookOrderingScheme.None,
            limit,
            skip,
            doNotRunQuery || !collectionReady
        );
        apiFilter = {
            parseDBQuery: bookQueryParams,
        };
    } else {
        // we're going to modify apiFilter, and don't want to modify statsProps, so make a copy.
        // This is important...if we don't so it, a stale fromDate or toDate can get saved
        // in statsProps.collection.statisticsQuerySpec, and then if later stats.Props.startDate
        // changes to undefined, the code below won't remove it.
        apiFilter = { ...statsProps.collection.statisticsQuerySpec };
    }

    if (statsProps.dateRange.startDate) {
        apiFilter.fromDate = getISODateString(statsProps.dateRange.startDate);
    }
    if (statsProps.dateRange.endDate) {
        apiFilter.toDate = getISODateString(statsProps.dateRange.endDate);
    }

    const url = `${getBloomApiUrl()}/stats/${urlSuffix}`;

    // Just below here, axios is going to decide whether or not to send another
    // query based on the values in apiFilter (the trigger parameter).
    // On a new page load, if the user is logged in, the value of X-Parse-Session-Token is going
    // to get added which will cause duplicate sequential requests with the page not loading until the
    // second one completes. Since we don't care if the user is logged in or not in this case,
    // just delete it here to prevent the problem.
    const apiFilterClone = JSON.parse(JSON.stringify(apiFilter));
    if (
        apiFilterClone &&
        apiFilterClone.parseDBQuery &&
        apiFilterClone.parseDBQuery.options &&
        apiFilterClone.parseDBQuery.options.headers
    ) {
        delete apiFilterClone.parseDBQuery.options.headers[
            "X-Parse-Session-Token"
        ];
    }
    const trigger = url + JSON.stringify(apiFilterClone);

    return useAxios({
        url,
        method: "POST",
        options: {
            data: {
                filter: apiFilter,
            },
        },
        trigger,
    });
}

function getISODateString(date: Date) {
    return toYyyyMmDd(date);
}

function processAxiosStatus(answer: IAxiosAnswer): ISimplifiedAxiosResult {
    if (answer.error)
        return {
            count: -2,
            books: [],
            error: answer.error,
            waiting: false,
        };
    return {
        books:
            answer.loading || !answer.response
                ? []
                : answer.response["data"]["results"],
        count:
            answer.loading || !answer.response
                ? -1
                : answer.response["data"]["count"],
        error: null,
        // loading appears to be totally unreliable. If we didn't get
        // some response yet, for our purposes, we're still waiting.
        waiting: answer.loading || !answer.response,
    };
}


function regexCaseSensitive(value: string) {
    return {
        $regex: processRegExp(value),
    };
}
const caseInsensitive = { $options: "i" };
function regex(value: string) {
    return {
        $regex: processRegExp(value),
        ...caseInsensitive,
    };
}

let _reportedDerivativeProblem = false;

export const kNameOfNoTopicCollection = "Other";

export function constructParseSortOrder(
    // We only pay attention to the first one at this point, as that's all I figured out
    sortingArray: { columnName: string; descending: boolean }[]
) {
    let order = "";
    if (sortingArray?.length > 0) {
        order = sortingArray[0].columnName;
        if (sortingArray[0].descending) {
            order = "-" + order; // a preceding minus sign means descending order
        }
    }
    return order;
}

export function constructParseBookQuery(
    params: any,
    filter: IFilter,
    allTagsFromDatabase: string[],
    orderingScheme?: BookOrderingScheme,
    limit?: number, //pagination
    skip?: number //pagination
): object {
    if (orderingScheme === undefined)
        orderingScheme = BookOrderingScheme.Default;

    if (filter?.derivedFromCollectionName) {
        // We should have already converted from derivedFromCollectionName to derivedFrom by now. See useProcessDerivativeFilter().
        alert("Attempted to load books with an invalid filter.");
        console.error(
            `Called constructParseBookQuery with a filter containing truthy derivedFromCollectionName (${filter.derivedFromCollectionName}). See useProcessDerivativeFilter().`
        );
    }

    // todo: I don't know why this is undefined
    console.assert(filter, "Filter is unexpectedly falsey. Investigate why.");
    const f: IFilter = filter ? filter : {};

    if (limit) {
        params.limit = limit;
    }
    if (skip) {
        params.skip = skip;
    }

    // language {"where":{"langPointers":{"$inQuery":{"where":{"isoCode":"en"},"className":"language"}},"inCirculation":{"$in":[true,null]}},"limit":0,"count":1
    // topic {"where":{"tags":{"$in":["topic:Agriculture","Agriculture"]},"license":{"$regex":"^\\Qcc\\E"},"inCirculation":{"$in":[true,null]}},"include":"langPointers,uploader","keys":"$score,title,tags,baseUrl,langPointers,uploader","limit":10,"order":"title",
    //{where: {search: {$text: {$search: {$term: "opposites"}}}, license: {$regex: "^\Qcc\E"},…},…}

    // doing a clone here because the semantics of deleting language from filter were not what was expected.
    // it removed the "language" param from the filter parameter itself.
    params.where = filter ? JSON.parse(JSON.stringify(filter)) : {};

    // parse server does not handle spaces in this comma-separated list,
    // so guard against programmer accidentally inserting one.
    // (It does not even complain, but quietly omits the field that has a space before it)
    if (params.keys) {
        params.keys = params.keys.replace(/ /g, "");
    }

    // A list of tags. If it contains anything, tags must contain each item.
    const tagsAll: string[] = [];
    // A list of tag queries, such as {$in:["level:1", "computedLevel:1"]} or {$regex:"topic:Agriculture|topic:Math"}
    // If it contains a single item and topicsAll is empty,
    // we can use params.where.tags = tagParts[0]. If it contains more than one, we need
    // params.where.$and:[{tags: tagParts[0]}, {tags: tagParts[1]}... {tags: {$all:topicsAll}}]
    const tagParts: object[] = [];
    if (!!f.search) {
        const { otherSearchTerms, specialParts } = splitString(
            f.search!,
            allTagsFromDatabase
        );
        for (const part of specialParts) {
            const facetParts = part.split(":").map((p) => p.trim());
            let facetLabel = facetParts[0];
            const facetValue = facetParts[1];
            switch (facetLabel) {
                case "title":
                case "copyright":
                case "country":
                case "publisher":
                case "originalPublisher":
                case "edition":
                case "brandingProjectName":
                case "branding":
                    if (facetLabel === "branding")
                        facetLabel = "brandingProjectName";
                    // partial match
                    params.where[facetLabel] = regex(facetValue);
                    break;
                case "license":
                    // exact match
                    params.where.license = {
                        $regex: `^${facetValue}$`,
                        ...caseInsensitive,
                    };
                    break;
                case "uploader":
                    params.where.uploader = {
                        $inQuery: {
                            where: {
                                email: regex(facetValue),
                            },
                            className: "_User",
                        },
                    };
                    break;
                case "feature":
                    // Note that if filter actually has a feature field (filter.feature is defined)
                    // that will win, overriding any feature: in the search field (see below).
                    params.where.features = facetValue;
                    if (facetValue === "activity") {
                        // old data had a separate entry for quiz, now we just consider that
                        // a kind of activity.
                        params.where.features = { $in: ["activity", "quiz"] };
                    }
                    break;
                case "phash":
                    // work around https://issues.bloomlibrary.org/youtrack/issue/BL-8327 until it is fixed
                    // This would be correct
                    //params.where.phashOfFirstContentImage = facetValue;
                    // But something is introducing "/r/n" at the end of phashes, so we're doing this for now
                    params.where.phashOfFirstContentImage = regexCaseSensitive(
                        facetValue
                    );
                    break;
                case "bookHash":
                    params.where.bookHashFromImages = facetValue;
                    break;
                case "harvestState":
                    params.where.harvestState = facetValue;
                    break;
                case "rebrand":
                    f.rebrand = parseBooleanOptions(facetValue);
                    break;
                case "language":
                    f.language = facetValue;
                    break;
                case "level":
                    if (facetValue === "empty") {
                        tagParts.push({
                            $nin: [
                                "level:1",
                                "level:2",
                                "level:3",
                                "level:4",
                                "computedLevel:1",
                                "computedLevel:2",
                                "computedLevel:3",
                                "computedLevel:4",
                            ],
                        });
                    } else {
                        tagParts.push({
                            $in: [
                                "computedLevel:" + facetValue,
                                "level:" + facetValue,
                            ],
                        });
                        // We don't want to get, for example, books whose computedLevel is 3
                        // if they have some other value for level. computedLevel is only a fall-back
                        // in case there is NO level.
                        const otherPrimaryLevels = [
                            "level:1",
                            "level:2",
                            "level:3",
                            "level:4",
                        ].filter((x) => x.indexOf(facetValue) < 0);

                        tagParts.push({
                            $nin: otherPrimaryLevels,
                        });
                    }
                    break;
                case "bookInstanceId":
                    params.where.bookInstanceId = facetValue;
                    f.draft = BooleanOptions.All;
                    f.inCirculation = BooleanOptions.All;
                    break;
                default:
                    tagsAll.push(part);
                    break;
            }
        }
        if (otherSearchTerms.length > 0) {
            params.where.search = {
                $text: {
                    $search: {
                        $term: removeUnwantedSearchTerms(otherSearchTerms),
                    },
                },
            };
            if (orderingScheme === BookOrderingScheme.Default) {
                if (params.keys === undefined) {
                    // If you don't specify *any* keys, then you get them all, fine.
                    // But if you only specify "$score", then that's all you will
                    // get and that's not enough to even identify the book.
                    params.keys = bookDetailFields;
                }
                if (params.keys.indexOf("$score") < 0) {
                    params.keys = "$score," + params.keys;
                }
            }
        } else {
            delete params.where.search;
        }
    }
    if (params.where.search?.length === 0) {
        delete params.where.search;
    }

    configureQueryParamsForOrderingScheme(params, orderingScheme);

    // if f.language is set, add the query needed to restrict books to those with that language
    if (f.language != null) {
        delete params.where.language; // remove that, we need to make it more complicated because we need a join.

        if (f.language === kTagForNoLanguage) {
            params.where.langPointers = { $eq: [] };
        } else {
            params.where.langPointers = {
                $inQuery: {
                    where: { isoCode: f.language },
                    className: "language",
                },
            };
        }
    }
    // topic is handled below. This older version is not compatible with the possibility of other topics.
    // Hopefully the old style really is gone. Certainly any update inserts topic:
    // if (f.topic != null) {
    // params.where.tags = {
    //     $in: [
    //         "topic:" + f.topic /* new style */,
    //         f.topic /*old style, which I suspect is all gone*/
    //     ]
    // };
    // }
    if (f.otherTags != null) {
        delete params.where.otherTags;
        f.otherTags.split(",").forEach((t) => tagsAll.push(t));
    }

    // I can't tell that f.bookShelfCategory is ever used for filtering.
    if (f.bookShelfCategory != null) {
        delete params.where.bookShelfCategory;
    }

    // if (f.topic) {
    //     tagParts.push("topic:" + f.topic);
    //     delete params.where.topic;

    // }

    // bookshelf is no longer used for filtering.
    if (f.bookshelf) {
        delete params.where.bookshelf;
    }
    // I think you can also do topic via search, but I need a way to do an "OR" in order to combine several topics for STEM
    // take `f.topic` to be a comma-separated list
    if (f.topic) {
        delete params.where.topic;
        if (f.topic === kNameOfNoTopicCollection) {
            // optimize: is it more efficient to try to come up with a regex that will
            // fail if it finds topic:?
            tagParts.push({
                $nin: kTopicList.map((t) => "topic:" + t),
            });
        } else if (f.topic.indexOf(",") >= 0) {
            const topicsRegex = f.topic
                .split(",")
                .map((s) => "topic:" + processRegExp(s))
                .join("|");
            tagParts.push({
                $regex: topicsRegex,
                ...caseInsensitive,
            });
        } else {
            // just one topic, more efficient not to use regex
            tagsAll.push("topic:" + f.topic);
        }
    }
    // Now we need to assemble topicsAll and tagParts
    if (tagsAll.length === 1 && tagParts.length === 0) {
        if (tagsAll[0].startsWith("*") || tagsAll[0].endsWith("*")) {
            const tagRegex = getPossiblyAnchoredRegex(tagsAll[0]);
            params.where.tags = { $regex: tagRegex };
        } else {
            params.where.tags = tagsAll[0];
        }
    } else {
        if (tagsAll.length) {
            // merge topicsAll into tagsAll
            const tagsAll2: any[] = [];
            tagsAll.forEach((tag) => {
                if (tag.startsWith("*") || tag.endsWith("*")) {
                    tagsAll2.push({ $regex: getPossiblyAnchoredRegex(tag) });
                } else {
                    tagsAll2.push(tag);
                }
            });
            if (tagsAll2.length === 1) {
                tagParts.push(tagsAll2[0]);
            } else {
                tagParts.push({
                    $all: tagsAll2,
                });
            }
        }
        if (tagParts.length === 1) {
            params.where.tags = tagParts[0];
        } else if (tagParts.length > 1) {
            params.where.$and = tagParts.map((p: any) => {
                return {
                    tags: p,
                };
            });
        }
    }
    if (f.feature != null) {
        delete params.where.feature;
        const features = f.feature.split(" OR ");
        if (features.length === 1) {
            params.where.features = f.feature; //my understanding is that this means it just has to contain this, could have others
        } else {
            params.where.features = { $in: features };
        }
    }
    delete params.where.inCirculation;
    // As of March 2024, we have a defaultValue of true on the _Schema table for inCirculation, so we can assume a value is set.
    // This helps the queries run more efficiently because we can use equality instead of inequality ($ne) or range ($nin).
    switch (f.inCirculation) {
        case undefined:
        case BooleanOptions.Yes:
            params.where.inCirculation = true;
            break;
        case BooleanOptions.No:
            params.where.inCirculation = false;
            break;
        case BooleanOptions.All:
            // just don't include it in the query
            break;
    }
    // Unless the filter explicitly allows draft books, don't include them.
    delete params.where.draft;
    // As of March 2024, we have a defaultValue of false on the _Schema table for draft, so we can assume a value is set.
    // This helps the queries run more efficiently because we can use equality instead of inequality ($ne) or range ($nin).
    switch (f.draft) {
        case BooleanOptions.Yes:
            params.where.draft = true;
            break;
        case undefined:
        case BooleanOptions.No:
            params.where.draft = false;
            break;
        case BooleanOptions.All:
            // just don't include it in the query
            break;
    }

    // keywordsText is not a real column. Don't pass this through
    // Instead, convert it to search against keywordStems
    delete params.where.keywordsText;
    if (f.keywordsText) {
        const [, keywordStems] = Book.getKeywordsAndStems(f.keywordsText);
        params.where.keywordStems = {
            $all: keywordStems,
        };
    }

    // We (gjm and jt) aren't sure why these two "delete" lines were ever needed, but now that we
    // add params for both publisher and originalPublisher, it doesn't work to delete them here.
    // If removing the delete lines causes a problem, we'll need to look for a different solution.
    // And now (01/18/2022) we've added edition and we're adding brandingProjectName. The delete just
    // undoes the 'facet' work above.
    // delete params.where.publisher;
    // delete params.where.originalPublisher;
    // delete params.where.edition;
    // delete params.where.brandingProjectName;
    if (f.publisher) {
        params.where.publisher = f.publisher;
    }
    if (f.originalPublisher) {
        params.where.originalPublisher = f.originalPublisher;
    }
    if (f.edition) {
        params.where.edition = f.edition;
    }
    if (f.brandingProjectName) {
        params.where.brandingProjectName = f.brandingProjectName;
    }

    delete params.where.derivedFrom;
    delete params.where.bookLineageArray;
    if (f.derivedFrom) {
        processDerivedFrom(f, allTagsFromDatabase, params);
    }

    delete params.where.originalCredits;
    if (f.originalCredits) {
        // NB: According to https://issues.bloomlibrary.org/youtrack/issue/BL-7990, the "Credits" column
        // on parse is actually the "original credits" in Bloom
        params.where.credits = f.originalCredits;
    }

    delete params.where.rebrand;
    // As of March 2024, we have a defaultValue of false on the _Schema table for rebrand, so we can assume a value is set.
    // This helps the queries run more efficiently because we can use equality instead of inequality ($ne) or range ($nin).
    switch (f.rebrand) {
        case BooleanOptions.Yes:
            params.where.rebrand = true;
            break;
        case BooleanOptions.No:
            params.where.rebrand = false;
            break;
        case BooleanOptions.All:
            // don't mention it
            break;
    }

    // With the new (Oct 2023) upload system which use an API, uploading new books is a two-step process.
    // While the book is first being uploaded, it has a blank baseUrl. Once the upload is complete, step 2
    // fills in the baseUrl. We don't want to show any books which are in this pending status.
    params.where.baseUrl = { $exists: true };

    if (isAppHosted()) {
        params.where.hasBloomPub = true;
    }

    if (f.anyOfThese) {
        delete params.where.anyOfThese;
        params.where.$or = [];
        for (const child of f.anyOfThese) {
            const pbq = constructParseBookQuery({}, child, []) as any;
            simplifyInnerQuery(pbq.where, child);
            params.where.$or.push(pbq.where);
        }
    }
    // console.log(
    //     `DEBUG constructParseBookQuery: params.where = ${JSON.stringify(
    //         params.where
    //     )}`
    // );
    return params;
}

function simplifyInnerQuery(where: any, innerQueryFilter: IFilter) {
    if (!innerQueryFilter.inCirculation) {
        delete where.inCirculation;
    }
    if (!innerQueryFilter.draft) {
        delete where.draft;
    }
    delete where.baseUrl;
}

function configureQueryParamsForOrderingScheme(
    params: any,
    orderingScheme: BookOrderingScheme
) {
    switch (orderingScheme) {
        case BookOrderingScheme.None: // used when we're just getting a count
            delete params.order;
            break;

        case BookOrderingScheme.Default:
            if (params.keys && params.keys.indexOf("$score") >= 0) {
                params.order = "$score"; // Parse's full text search
            } else {
                // Note that "title" sounds like the right default, but it is useless in many cases because it is just one of
                // the languages, not the language that is in context of this page. See BL-11137.
                params.order = "-createdAt";
            }
            break;
        case BookOrderingScheme.NewestCreationsFirst:
            params.order = "-createdAt";
            break;
        case BookOrderingScheme.LastUploadedFirst:
            params.order = "-lastUploaded";
            break;
        case BookOrderingScheme.TitleAlphabetical:
        case BookOrderingScheme.TitleAlphaIgnoringNumbers:
            delete params.order;
            // We need to sort these client-side for now. When we switch to postgresql, we can do it in the query.
            // Sorting client-side requires that we get all of them (yes, we're going to use this mode SPARINGLY).
            params.limit = Number.MAX_SAFE_INTEGER; // we can't sort unless we get all of them
            break;

        default:
            throw new Error("Unhandled book ordering scheme");
    }
}
function removeUnwantedSearchTerms(searchTerms: string): string {
    const termsToRemove = [
        "book",
        "books",
        "libro",
        "libros",
        "livre",
        "livres",
    ];
    return searchTerms
        .replace(
            new RegExp("\\b(" + termsToRemove.join("|") + ")\\b", "gi"),
            " "
        )
        .replace(/\s{2,}/g, " ")
        .trim();
}

function processDerivedFrom(
    f: IFilter,
    allTagsFromDatabase: string[],
    params: any
) {
    if (!f || !f.derivedFrom) return;

    // this wants to be something like {$not: {where: innerWhere}}
    // but I can't find any variation of that which works.
    // For now, we just support these three kinds of parent filters
    // (and only otherTags ones that are simple, exact matches of single tags).
    let nonParentFilter: any;
    if (f.derivedFrom.otherTags) {
        nonParentFilter = { tags: { $ne: f.derivedFrom.otherTags } };
    } else if (f.derivedFrom.publisher) {
        nonParentFilter = {
            publisher: { $ne: f.derivedFrom.publisher },
        };
    } else if (f.derivedFrom.brandingProjectName) {
        nonParentFilter = {
            brandingProjectName: {
                $ne: f.derivedFrom.brandingProjectName,
            },
        };
    } else if (!_reportedDerivativeProblem) {
        _reportedDerivativeProblem = true;
        alert(
            "derivatives collection may include items from original collection"
        );
    }
    const innerWhere = (constructParseBookQuery(
        {},
        f.derivedFrom,
        allTagsFromDatabase
    ) as any).where;
    simplifyInnerQuery(innerWhere, f.derivedFrom);
    const bookLineage = {
        bookLineageArray: {
            $select: {
                query: { className: "books", where: innerWhere },
                key: "bookInstanceId",
            },
        },
    };
    if (params.where.$and) {
        params.where.$and.push(bookLineage);
    } else {
        params.where.$and = [bookLineage];
    }
    if (nonParentFilter) {
        params.where.$and.push(nonParentFilter);
    }
}

export function getCountString(queryResult: any): string {
    const { response, loading, error } = queryResult;
    if (loading || !response) return "";
    if (error) return "error";
    return response["data"]["count"].toString();
}

export interface IUserBookPermissions {
    reupload: boolean;
    delete: boolean;
    editSurfaceMetadata: boolean;
    editAllMetadata: boolean;
}
export function useGetPermissions(
    isUserLoggedIn: boolean,
    bookDatabaseId: string
): IUserBookPermissions {
    const axiosParams = {
        url: getBloomApiBooksUrl(bookDatabaseId, "permissions"),
        method: "GET" as const,
        // Setting trigger to undefined prevents useAxios (which we must call unconditionally because it is a hook)
        // from actually sending the query if the user is not logged in.
        trigger: isUserLoggedIn ? "true" : undefined,
        options: { headers: getBloomApiHeaders() },
    };
    const { response, loading, error } = useAxios(axiosParams);
    if (!isUserLoggedIn || loading || !response || !response["data"] || error) {
        return {} as IUserBookPermissions;
    }
    return response["data"] as IUserBookPermissions;
}

export async function deleteBook(bookDatabaseId: string) {
    return axios.delete(getBloomApiBooksUrl(bookDatabaseId), {
        headers: getBloomApiHeaders(),
    });
}

// // Since info.lang1Tag doesn't appear in the list of actualLangs, we need to try to find
// // the language tag in actualLangs that seems to be the best match for the book.
// function findBetterLangTagIfPossible(
//     info: IMinimalBookInfo,
//     actualLangs: string[],
//     allTitles: string
// ): string | undefined {
//     const lang1Tag = info.lang1Tag;
//     if (!lang1Tag) {
//         return lang1Tag;
//     }
//     const titleLangs = Array.from(
//         Object.keys(JSON.parse(allTitles.replace(/\n/g, "\\n")))
//     );
//     if (actualLangs.length === 1) {
//         // If there's only one language assigned to the book, we can be sure that's the one we want.
//         return actualLangs[0];
//     }
//     if (actualLangs.filter((x) => x.startsWith(lang1Tag + "-")).length === 1) {
//         // This is a special case where we have a book in a language that is a variant of another language.
//         // We want to use the variant language code, not the generic one.
//         // For instance, the book started with qaa, but has since been assigned qaa-x-Fooness.
//         const newLang = actualLangs.filter((x) =>
//             x.startsWith(lang1Tag + "-")
//         )[0];
//         return newLang;
//     }
//     if (actualLangs.filter((x) => x === lang1Tag.split("-")[0]).length === 1) {
//         // This is a special where a variant language code is not appropriate, but should be
//         // replaced with the generic language code.
//         // For instance, the book started with fuv-Arab, but has since been assigned fuv because
//         // it isnt' actually in the Arabic script.
//         const newLang = actualLangs.filter(
//             (x) => x === lang1Tag.split("-")[0]
//         )[0];
//         return newLang;
//     }
//     if (
//         lang1Tag !== "en" &&
//         actualLangs.filter((x) => x !== "en").length === 1
//     ) {
//         // When lang1Tag is not English, we'll assume the single non-English language
//         // assigned to the book is the correct choice.
//         const newLang = actualLangs.filter((x) => x !== "en")[0];
//         return newLang;
//     }
//     const actualLangsNotInTitles = actualLangs.filter(
//         (x) => !titleLangs.includes(x)
//     );
//     if (actualLangsNotInTitles.length === 1) {
//         // We'll assume the single language not in the title list is correct.
//         // This is not a perfect solution, but it's the best we can do with the information we have.
//         return actualLangsNotInTitles[0];
//     }
//     if (
//         lang1Tag !== "en" &&
//         actualLangsNotInTitles.filter((x) => x !== "en").length === 1
//     ) {
//         // We'll assume the single non-English language not in the title list is correct.
//         // This is not a perfect solution, but it's the best we can do with the information we have.
//         return actualLangsNotInTitles.filter((x) => x !== "en")[0];
//     }
//     if (lang1Tag === "xkg" && actualLangs.includes("kcg-x-Gworog")) {
//         // This is truly a special case, but is justified by the state of our data.  :-)
//         return "kcg-x-Gworog";
//     }
//     // If we can't figure it out, we'll just use the original language code.
//     return lang1Tag;
// }

// Get the basic information about books and users for the language-grid, country-grid,
// and uploader-grid pages.
async function retrieveBookAndUserData() {
    return axios.get(`${getConnection().url}classes/books`, {
        headers: getConnection().headers,
        params: {
            limit: 1000000, // all of them
            // show and allTitles were used as keys for determining lang1Tag, but we're not using it now
            keys: "uploader,langPointers,createdAt,tags",
            // fluff up fields that reference other tables
            include: "uploader,langPointers",
            where: { inCirculation: true, draft: false, rebrand: false },
        },
    });
}

interface IBasicLangInfo {
    objectId: string;
    isoCode: string;
}
interface IMinimalBookInfoPlus extends IMinimalBookInfo {
    //show?: { pdf: { langTag: string } }; // there is more, but this is what we're using to get at l1 at the moment
    langPointers: IBasicLangInfo[];
    //allTitles: string;
}
// Retrieve an array of minimal information for all accessible books and
// their uploaders.
export function useGetDataForAggregateGrid(): IMinimalBookInfo[] {
    const [result, setResult] = useState<IMinimalBookInfo[]>([]);
    const { response, loading, error } = useAsync(
        () => retrieveBookAndUserData(),
        "trigger",
        false
    );
    useEffect(() => {
        if (
            loading ||
            error ||
            !response ||
            !response["data"] ||
            !response["data"]["results"]
        ) {
            if (error)
                console.error(
                    `Error in useGetDataForAggregateGrid: ${JSON.stringify(
                        error
                    )}`
                );
            setResult([]);
        } else {
            const bookInfos = response["data"][
                "results"
            ] as IMinimalBookInfoPlus[];
            const infos: IMinimalBookInfo[] = bookInfos.map((bookInfo) => {
                const info: IMinimalBookInfo = {
                    objectId: bookInfo.objectId,
                    createdAt: bookInfo.createdAt,
                    // we need only the level and computedLevel tags
                    tags: bookInfo.tags.filter((tag) =>
                        tag.toLowerCase().includes("level:")
                    ),
                    uploader: bookInfo.uploader,
                    //lang1Tag: bookInfo.show?.pdf?.langTag,
                    languages: bookInfo.langPointers.map((lp) => lp.isoCode),
                };
                // if (info.lang1Tag) {
                //     if (
                //         bookInfo.langPointers &&
                //         bookInfo.langPointers.length > 0
                //     ) {
                //         if (!info.languages.includes(info.lang1Tag)) {
                //             // We have a book whose presumed primary language is not in the list
                //             // of actual languages assigned to the book. This is a problem but
                //             // we may be able to figure things out with the information we do have.
                //             const newLangTag = findBetterLangTagIfPossible(
                //                 info,
                //                 info.languages,
                //                 bookInfo.allTitles
                //             );
                //             // A number of books have only English assigned, but the title is in a
                //             // different language, and there is no text in English.
                //             if (
                //                 newLangTag !== info.lang1Tag &&
                //                 (newLangTag !== "en" ||
                //                     info.lang1Tag.startsWith("en"))
                //             ) {
                //                 // console.warn(
                //                 //     `DEBUG: replacing ${info.lang1Tag} with ${newLangTag} for ${info.objectId}`
                //                 // );
                //                 info.lang1Tag = newLangTag;
                //             }
                //         }
                //     }
                // }
                return info;
            });
            setResult(infos);
        }
    }, [response, loading, error]);

    return result;
}

// Some axios calls should be shared between hook and non-hook uses.  useAxios is
// great if the call doesn't need to be shared, but is unusable ouside of hooks.
// This generic hook allows us to feed in a function that calls axios and returns
// its Promise.  This function is adapted from the one developed in the web article
// https://dev.to/lukasmoellerch/a-hook-to-use-promise-results-2hfd.
const useAsync = <T>(
    fn: () => Promise<T>,
    trigger: string,
    doNotActuallyCallFunction?: boolean
) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | undefined>();
    const [response, setResponse] = useState<T | undefined>();
    useEffect(() => {
        if (doNotActuallyCallFunction) {
            //console.log("Did not call function for useAsync");
            setLoading(false);
            setError(undefined);
            setResponse(undefined);
            return () => (cancel = true);
        }
        setLoading(true);
        let cancel = false;
        fn().then(
            (result) => {
                if (cancel) return;
                setResponse(result);
                setLoading(false);
            },
            (error) => {
                if (cancel) return;
                setError(error);
                setLoading(false);
            }
        );
        return () => {
            cancel = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger]);
    return { response, loading, error };
};

function getPossiblyAnchoredRegex(tagValue: string): string {
    if (tagValue.startsWith("*") && tagValue.endsWith("*")) {
        // floating regex, but case sensitive.
        return processRegExp(
            tagValue.substring(0, tagValue.length - 1).substring(1)
        );
    }
    // Anchor the regex if possible and leave it case sensitive.  This is the most efficient form of regex.
    if (tagValue.endsWith("*")) {
        const tagPrefix = tagValue.substring(0, tagValue.length - 1);
        return "^" + processRegExp(tagPrefix);
    }
    // must start with "*": anchor the regex at the end
    const tagSuffix = tagValue.substring(1);
    return processRegExp(tagSuffix) + "$";
}
