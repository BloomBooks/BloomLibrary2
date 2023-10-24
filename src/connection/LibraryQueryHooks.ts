import useAxios, { IReturns, axios, IParams } from "@use-hooks/axios";
import { AxiosResponse } from "axios";
import { IFilter, BooleanOptions, parseBooleanOptions } from "../IFilter";
import { getConnection } from "./ParseServerConnection";
import { getBloomApiUrl } from "./ApiConnection";
import { retrieveBookData, retrieveBookStats } from "./LibraryQueries";
import { Book, createBookFromParseServerData } from "../model/Book";
import { useContext, useMemo, useEffect, useState } from "react";
import { CachedTablesContext } from "../model/CacheProvider";
import { getCleanedAndOrderedLanguageList, ILanguage } from "../model/Language";
import { processRegExp } from "../Utilities";
import { kTopicList } from "../model/ClosedVocabularies";
import {
    IBookStat,
    IStatsPageProps,
} from "../components/statistics/StatsInterfaces";
import { toYyyyMmDd } from "../Utilities";
import {
    useGetCollection,
    getFilterForCollectionAndChildren,
} from "../model/Collections";
import { doExpensiveClientSideSortingIfNeeded } from "./sorting";
import { BookOrderingScheme } from "../model/ContentInterfaces";
import { isAppHosted } from "../components/appHosted/AppHostedUtils";

/**
 * @summary The minimum fields returned by Parse
 */
export interface IParseCommonFields {
    objectId: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * @summary Represents the data returned by Parse.
 * This interfaces represents the type of the AxiosResponse object's data field.
 * @param T For strict typing, define the parameterized type T as accurately as feasible. It is the type of each result record returned by Parse.
 * To ignore typing, just use "any" or leave blank (defaults to any) as the type
 */
export interface IParseResponseData<T = any> {
    count?: number;
    results: Array<T>;
}

/**
 * @summary Represents the data returned by Parse if count has been requested..
 * This interfaces represents the type of the AxiosResponse object's data field.
 * @param T For strict typing, define the parameterized type T as accurately as feasible. It is the type of each result record returned by Parse.
 * To ignore typing, just use "any" or omit (defaults to any) as the type
 */
export interface IParseResponseDataWithCount<T = any> {
    count: number;
    results: Array<T>;
}

/**
 * @summary For things other than books, which should use `useBookQuery()`
 * @param T The type of the result record returned by Parse. Or use "any" or omit to ignore types.
 * If doNotActuallyRunQuery is true, the query will not be executed, and the result will always be empty.
 * (This is useful when rules of hooks force us to call this unconditionally, but we sometimes don't want to.)
 */
function useLibraryQuery<T = any>(
    queryClass: string,
    params: {},
    doNotActuallyRunQuery?: boolean
): IReturns<IParseResponseData<T>> {
    return useAxios<IParseResponseData<T>>({
        url: `${getConnection().url}classes/${queryClass}`,
        method: "GET",
        trigger: "true",
        forceDispatchEffect: () => !doNotActuallyRunQuery,
        options: {
            headers: getConnection().headers,
            params,
        },
    });
}

/**
 * @summary Same as useLibraryQuery, but modifies params to request the count
 */
function useLibraryQueryWithCount<T = any>(
    queryClass: string,
    params: {},
    doNotActuallyRunQuery?: boolean
): IReturns<IParseResponseDataWithCount<T>> {
    return useLibraryQuery(
        queryClass,
        { ...params, count: 1 },
        doNotActuallyRunQuery
    ) as IReturns<IParseResponseDataWithCount<T>>;
}

function useGetLanguagesList() {
    // Get books with usageCount > 0 and usageCount === undefined.
    // Undefined just means the hourly process hasn't run to update it.
    // Later, in getCleanedAndOrderedLanguageList, we'll assume undefined usageCount is 1.
    return useLibraryQuery<IParseCommonFields & ILanguage>("language", {
        keys: "name,englishName,usageCount,isoCode",
        where:
            '{"$or":[{"usageCount":{"$gt":0}},{"usageCount":{"$exists":false}}]}',
        limit: 10000,
        order: "-usageCount",
    });
}
export function useGetCleanedAndOrderedLanguageList(): ILanguage[] {
    const axiosResult = useGetLanguagesList();
    if (axiosResult.response?.data?.results) {
        return getCleanedAndOrderedLanguageList(
            axiosResult.response.data.results
        );
    }

    return [];
}
export function useGetTagList(): string[] {
    // I'd prefer to use useAppHosted but it crashes, I think because this code runs outside the
    // scope where it works.
    const appHosted = isAppHosted();
    const axiosResult = useLibraryQueryWithCount(
        "tag",
        {
            limit: Number.MAX_SAFE_INTEGER,
            order: "name",
        },
        appHosted // don't actually run the query if we're app hosted; we don't need tags
    );
    if (appHosted) {
        return ["dummy"]; // don't need the list, but need non-empty to stop waiting.
    }

    if (axiosResult.response?.data?.results) {
        assertAllParseRecordsReturned(axiosResult.response);
        return axiosResult.response.data.results.map(
            (parseTag: { name: string }) => {
                return parseTag.name;
            }
        );
    }
    return [];
}

/**
 * @summary Use this method after calls to Parse that the caller expects to returns all matching records (as opposed to requests that explicitly support paging)
 * @param axiosResponseData: An AxiosResponse object. Its "data" field must have a count field and a results array within it (i.e., implements IParseAxiosResponseWithCount)
 */
export function assertAllParseRecordsReturned(
    axiosResponse: AxiosResponse<IParseResponseDataWithCount<unknown>>
) {
    const totalMatchingRecords = axiosResponse.data.count;
    const recordsInThisResponse = axiosResponse.data.results.length;

    console.assert(
        totalMatchingRecords === recordsInThisResponse,
        `Incomplete records returned in Parse request. Please investigate. ${recordsInThisResponse} returned, ${totalMatchingRecords} total.`
    );
}

export function useGetTopicList() {
    // todo: this is going to give more than topics
    return useLibraryQuery("tag", { limit: 1000, count: 1000 });
}

export function useGetLanguageInfo(language: string): ILanguage[] {
    const axiosResult = useLibraryQuery<ILanguage>("language", {
        where: { isoCode: language },
        keys: "isoCode,name,usageCount,bannerImageUrl",
    });

    return axiosResult.response?.data?.results ?? [];
}

// Gets the count of books matching {filter}
// shouldSkipQuery: If defined and set to true, then this method will not actually cause the query to run.
//     This can be useful with conditional hooks due to Rules of Hooks)
export function useGetBookCountRaw(filter: IFilter, shouldSkipQuery?: boolean) {
    return useBookQueryInternal(
        { limit: 0, count: 1 },
        filter,
        BookOrderingScheme.None,
        undefined,
        undefined,
        shouldSkipQuery
    );
}

export function useGetBookCount(filter: IFilter): number {
    const answer = useBookQueryInternal(
        { limit: 0, count: 1 },
        filter,
        BookOrderingScheme.None
    );
    if (!answer.response) {
        return 0;
    }
    const s = answer.response["data"]["count"];
    return parseInt(s, 10);
}
export function useGetRelatedBooks(bookId: string): Book[] {
    const { response, loading, error } = useAxios({
        url: `${getConnection().url}classes/relatedBooks`,
        method: "GET",
        trigger: "true",
        options: {
            headers: getConnection().headers,
            params: {
                where: {
                    books: {
                        __type: "Pointer",
                        className: "books",
                        objectId: bookId,
                    },
                },
                // This dot notation should cause it to get just the two fields we care
                // about (search for "multi level includes using dot notation" in parse
                // server doc), but it actually seems to get them all, just like include: "books".
                // May as well leave it in since it might work if we upgrade to a later
                // parse server version. It's surely faster
                // to just get it all than to get the bookids and then do separate queries to get
                // the titles and check they are in circulation.
                include: "books.title,books.inCirculation",
            },
        },
    });

    if (
        loading ||
        !response ||
        !response["data"] ||
        !response["data"]["results"] ||
        response["data"]["results"].length === 0 ||
        error
    ) {
        return [];
    }
    return (
        response["data"]["results"][0].books
            // don't return the book for which we're looking for related books,
            // or any that have been specifically put out of circulation.
            .filter(
                (r: any) => r.objectId !== bookId && r.inCirculation !== false
            )
            .map((r: any) => createBookFromParseServerData(r))
    );
}
/*
export function useGetPhashMatchingRelatedBooks(
    bookId: string,
    phashOfFirstContentImage: string
): Book[] {
    const { response, loading, error } = useAxios({
        url: `${getConnection().url}classes/books`,
        method: "GET",
        trigger: !phashOfFirstContentImage
            ? "false"
            : bookId + phashOfFirstContentImage,

        options: {
            headers: getConnection().headers,
            params: {
                where: { phashOfFirstContentImage },
                // We don't really need all the fields of the related books, but I don't
                // see a way to restrict to just the fields we want. It's surely faster
                // to just get it all then get the bookids and then do separate queries to get their titles
                include: "books",
            },
        },
    });

    if (
        loading ||
        !response ||
        !response["data"] ||
        !response["data"]["results"] ||
        response["data"]["results"].length === 0 ||
        error
    ) {
        return [];
    }
    return response["data"]["results"]
        .filter((r: any) => r.objectId !== bookId) // don't return the book for which we're looking for related books.
        .map((r: any) => createBookFromParseServerData(r));
}
*/

export const bookDetailFields =
    "title,allTitles,baseUrl,bookOrder,inCirculation,draft,license,licenseNotes,summary,copyright,harvestState,harvestLog," +
    "tags,pageCount,phashOfFirstContentImage," +
    // show is in here in order to let us figure out L1, which is, sadly, not directly listed in Parse nor determinable from the langPointers
    "show," +
    "credits,country,features,internetLimits," +
    "librarianNote,uploader,langPointers,importedBookSourceUrl,downloadCount,suitableForMakingShells,lastUploaded," +
    "harvestStartedAt,publisher,originalPublisher,keywords,bookInstanceId,brandingProjectName,edition,rebrand,bloomPUBVersion";
export function useGetBookDetail(bookId: string): Book | undefined | null {
    const { response, loading, error } = useAxios({
        url: `${getConnection().url}classes/books`,
        method: "GET",
        trigger: "true",
        options: {
            headers: getConnection().headers,
            params: {
                // Technically, we want to also add this to the where:
                //   baseUrl: { $exists: true }
                // But it probably isn't worth the (even minimal) less performant query.
                // If someone explicitly goes to a page for a book which is still pending,
                // they just get an error or a useless page.
                where: { objectId: bookId },
                keys: bookDetailFields,
                // fluff up fields that reference other tables
                // Note that what we're going to get in langPointers is actually the data from the rows of language,
                // because of this statement:
                include: "uploader,langPointers",
            },
        },
    });

    if (
        loading ||
        !response ||
        !response["data"] ||
        !response["data"]["results"]
    ) {
        return undefined;
    }
    if (response["data"]["results"].length === 0) {
        return null;
    }
    if (error) {
        return null;
    }

    const detail: Book = createBookFromParseServerData(
        response["data"]["results"][0]
    );

    // const parts = detail.tags.split(":");
    // const x = parts.map(p => {tags[(p[0]) as string] = ""});

    // return parts[0] + "-" + parts[1];
    // detail.topic =

    return detail;
}

// gives you just enough to make cards
export function useGetBasicBookInfos(
    ids: string[]
): IBasicBookInfo[] | undefined {
    const { response } = useAxios<IParseResponseData<IBasicBookInfo>>({
        url: `${getConnection().url}classes/books`,
        method: "GET",
        trigger: "true",
        options: {
            headers: getConnection().headers,
            params: {
                where: {
                    objectId: { $in: ids.map((id) => id) },
                },
                keys: kFieldsOfIBasicBookInfo,
                include: "langPointers", // get the actual language objects pointed to by langPointers
            },
        },
    });
    if (response) {
        return response["data"]["results"].map((rawInfo: any) => {
            const bookInfo: IBasicBookInfo = { ...rawInfo };
            // Here langPointers is not just the "pointers". It's the actual language objects.
            bookInfo.languages = rawInfo.langPointers;
            bookInfo.lang1Tag = bookInfo.show!.pdf.langTag;
            return bookInfo;
        });
    }
    return undefined;
}

interface IGridResult {
    onePageOfMatchingBooks: Book[];
    totalMatchingBooksCount: number;
}

export const gridBookKeys =
    "objectId,bookInstanceId," +
    "title,baseUrl,license,licenseNotes,inCirculation,draft,summary,copyright,harvestState," +
    "harvestLog,harvestStartedAt,tags,pageCount,phashOfFirstContentImage,show,credits,country," +
    "features,internetLimits,librarianNote,uploader,langPointers,importedBookSourceUrl," +
    "downloadCount,publisher,originalPublisher,keywords,edition,rebrand,leveledReaderLevel";

export const gridBookIncludeFields = "uploader,langPointers";

// the axios calls here (in the useAsync(=>retrieveBook(Data|Stats) calls) are shared with getAllGridDataAndExportCsv
// in GridExport.ts except for the skip and limit parameters.  This hook gets one page worth of books: the other function
// retrieves data for all of the books in one query.  We have separate methods because this is a hook, and uses
// a hook to access axios, while the other method is invoked in response to clicking a button for exporting.
export function useGetBooksForGrid(
    filter: IFilter,
    limit: number,
    skip: number,
    // We only pay attention to the first one at this point, as that's all I figured out
    sortingArray: Array<{ columnName: string; descending: boolean }>,
    keysToGet?: string, // defaults to gridBookKeys if not defined
    doNotActuallyRunQuery?: boolean
): IGridResult {
    //console.log("Sorts: " + sortingArray.map(s => s.columnName).join(","));
    const { tags } = useContext(CachedTablesContext);
    const [result, setResult] = useState<IGridResult>({
        onePageOfMatchingBooks: [],
        totalMatchingBooksCount: 0,
    });

    // Enhance: this only pays attention to the first one at this point, as that's all I figured out how to do
    const order = constructParseSortOrder(sortingArray);
    const query = constructParseBookQuery({}, filter, tags);
    const trigger =
        JSON.stringify(filter) +
        limit.toString() +
        skip.toString() +
        order.toString();
    const { response, loading, error } = useAsync(
        () => retrieveBookData(query, order, skip, limit, keysToGet),
        trigger,
        doNotActuallyRunQuery
    );
    const stats = useAsync(
        () => retrieveBookStats(query, order, skip, limit),
        trigger,
        doNotActuallyRunQuery
    );

    // Before we had this useEffect, we would get a new instance of each book, each time the grid re-rendered.
    // Besides being inefficient, it led to a very difficult bug in the embedded staff panel where we would
    // change the tags list, only to have the old value of tags overwrite the change we just made when the
    // grid re-rendered.
    useEffect(() => {
        if (
            doNotActuallyRunQuery ||
            loading ||
            !response ||
            !response["data"] ||
            !response["data"]["results"]
        ) {
            setResult({
                onePageOfMatchingBooks: [],
                totalMatchingBooksCount: -1,
            });
        } else if (response["data"]["results"].length === 0 || error) {
            setResult({
                onePageOfMatchingBooks: [],
                totalMatchingBooksCount: 0,
            });
        } else {
            const onePageOfBooks = response["data"][
                "results"
            ].map((r: object) => createBookFromParseServerData(r));

            setResult({
                onePageOfMatchingBooks: onePageOfBooks,
                totalMatchingBooksCount: response["data"]["count"],
            });
            if (
                !stats.loading &&
                !stats.error &&
                stats.response &&
                stats.response["data"] &&
                stats.response["data"]["stats"] &&
                stats.response["data"]["stats"].length > 0
            ) {
                joinBooksAndStats(onePageOfBooks, stats.response["data"]);
            }
        }
    }, [
        loading,
        error,
        response,
        stats.loading,
        stats.error,
        stats.response,
        doNotActuallyRunQuery,
    ]);
    return result;
}

// The basic data for books and the analytic statistics are currently stored in different
// databases in the Cloud.  We want to join the statistics for each book with the read of
// the data for that book to display or save.  This method effectively does the desired
// join by adding the statistics represented by raw JSON returned from a web api call to
// the appropriate books in the input array of Book objects.  The array of Books must be
// created from a compatible (but separate) web api call so that the book instance ids in
// the two sets of input data can match up properly.
export function joinBooksAndStats(books: Book[], bookStats: any) {
    // Set up (builtin javascript) hashmap for faster access to book via its instance id.
    const bookFromIdMap: any = {};
    books.forEach((book: Book) => {
        bookFromIdMap[book.bookInstanceId] = book;
    });
    bookStats["stats"].forEach((statRow: any) => {
        const book: Book = bookFromIdMap[statRow.bookinstanceid];
        if (book) {
            book.stats = extractBookStatFromRawData(statRow);
        } else {
            console.error(
                `stats row did not match any book provided: ${JSON.stringify(
                    statRow
                )}`
            );
        }
    });
}

export function extractBookStatFromRawData(statRow: any): IBookStat {
    const stats: IBookStat = {
        title: statRow.booktitle,
        branding: statRow.bookbranding,
        language: statRow.language,
        // The parseInt and parseFloat methods are important.
        // Without them, js will treat the values like strings even though typescript knows they are numbers.
        // Then the + operator will concatenate instead of add.
        startedCount: parseInt(statRow.started, 10) || 0,
        finishedCount: parseInt(statRow.finished, 10) || 0,
        shellDownloads: parseInt(statRow.shelldownloads, 10) || 0,
        pdfDownloads: parseInt(statRow.pdfdownloads, 10) || 0,
        epubDownloads: parseInt(statRow.epubdownloads, 10) || 0,
        bloomPubDownloads: parseInt(statRow.bloompubdownloads, 10) || 0,
        questions: parseInt(statRow.numquestionsinbook, 10) || 0,
        quizzesTaken: parseInt(statRow.numquizzestaken, 10) || 0,
        meanCorrect: parseFloat(statRow.meanpctquestionscorrect) || 0.0,
        medianCorrect: parseFloat(statRow.medianpctquestionscorrect) || 0.0,
    };
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
    "title,baseUrl,objectId,langPointers,tags,features,lastUploaded,harvestState,harvestStartedAt,pageCount,phashOfFirstContentImage,allTitles,edition,draft,rebrand,inCirculation,show";

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

const facets = [
    "title:",
    "uploader:",
    "copyright:",
    "harvestState:",
    "country:",
    "phash:",
    "level:",
    "feature:",
    "originalPublisher:", // must come before "publisher:", since "originalPublisher:" includes the other as a substring
    "publisher:",
    "language:",
    "brandingProjectName:",
    "branding:",
    "rebrand:",
    "bookInstanceId:",
];

export function isFacetedSearchString(searchString: string): boolean {
    for (const facet of facets) {
        if (searchString.toLowerCase().startsWith(facet.toLowerCase()))
            return true;
        if (searchString.toLowerCase().includes(" " + facet.toLowerCase()))
            return true;
    }
    return false;
}

// Given strings such as might be typed into the search box, split them into bits that
// should be treated as individual keywords to search for, and bits that should be
// treated as additional search facets,
// for example tags (system:Incoming), uploader:___, harvestState:___, etc.
// Known possible tags are
// passed as tagOptions1.
// In a typical string, "topic:Health dogs cats" we would get back keywords
// "dogs cats" and specialPart topic:Health. Items are delimited by spaces
// and ones with colons embedded are special. This would find books with that topic
// and mentioning either dogs or cats in any of the text search indexed fields.
// Known tags are treated as a unit even if they contain spaces.
// Quotes get no special treatment by this code, but do by the text search code.
// 'dogs bookshelf:enabling writers workshop "black birds"' will return two keywords
// 'dogs "black birds"' and one specialPart (bookshelf:enabling writers workshop),
// assuming that is a currently known tag.
// Note that the quotes are kept around "black birds"; thus, this search will find
// books with that tag AND "black birds" (quoted strings are required). In this case
// the addition of "dogs" has no effect.
// Pathological cases are possible. /"dogs topic:health"/ is weird because the known
// topic is inside quotes. Currently the code will still extract the topic, leaving something
// like '"dogs"'.
// "bookshelf: enabling writers workshop" and "topic: Health" are probably meant as
// special parts. Accordingly, if a colon is followed by white space, the white space is dropped.
// There are special cases for uploader:fred@example.com and copyright:Pratham. When
// these two prefixes are seen, the specialPart includes whatever follows up to the
// next space or the end of the input. That text will be taken as a regular expression
// and used to search the uploader name or copyright field.
// (Uploader, being an email address, can't have spaces. The copyright message could,
// of course. Currently there's no obvious way to search for copyright "John Smith"
// exactly. We may add something one day. Because it's a regular expression,
// copyright:John.Smith would come pretty close.)
export function splitString(
    input: string,
    // these would be things like "system:Incoming"
    allTagsInDatabase: string[]
): { otherSearchTerms: string; specialParts: string[] } {
    /*  JH/AP removed April 6 2020 because tags was optional (fine),
    but then this method would essentially bail out if you didn't provide tags.

    if (!allTagsInDatabase) {
        // should only happen during an early render that happens before we get
        // the results of the tag query.
        return { otherSearchTerms: input, specialParts: [] };
    }
    */

    const possibleParts = [...facets, ...allTagsInDatabase];
    // Start with the string with extra spaces (doubles and following colon) removed.
    let otherSearchTerms = input
        .replace(/ {2}/g, " ")
        .trim()
        .replace(/: /g, ":");
    const specialParts: string[] = [];
    // Each iteration attempts to find and remove a special part.
    for (;;) {
        let gotOne = false;
        const otherSearchTermsLc = otherSearchTerms.toLowerCase();
        for (const possiblePart of possibleParts) {
            const possiblePartLowerCase = possiblePart.toLowerCase();
            const index = otherSearchTermsLc.indexOf(possiblePartLowerCase);
            if (index < 0) continue;
            gotOne = true;
            let end = index + possiblePart.length;
            const isFacet = facets.includes(possiblePart);
            let part = otherSearchTerms.substring(index, end);
            if (isFacet) {
                const result = getFacetPartWithOrWithoutQuotes(
                    otherSearchTerms,
                    index,
                    end
                );
                part = result.part;
                end = result.end;
            }
            // If possibleParts contains an exact match for the part, we'll keep that case.
            // So for example if we have both system:Incoming and system:incoming, it's
            // possible to search for either. Otherwise, we want to switch to the case
            // that actually occurs in the database, because tag searches are case sensitive
            // and won't match otherwise.
            if (!isFacet && possibleParts.indexOf(part) < 0) {
                part = possiblePart;
            }
            specialParts.push(part);
            otherSearchTerms = (
                otherSearchTerms.substring(0, index) +
                " " +
                otherSearchTerms.substring(end, otherSearchTerms.length)
            )
                // I'm not sure this cleanup matters to the mongo search engine, but
                // it makes results more natural and predictable for testing
                .replace(/\s+/, " ") // easier than trying to adjust endpoints to get exactly one space
                .trim(); // in case we removed from start or end
            break;
        }
        if (!gotOne) break;
    }

    return { otherSearchTerms, specialParts };
}

function getFacetPartWithOrWithoutQuotes(
    searchString: string,
    startIndex: number,
    endIndex: number
): { part: string; end: number } {
    const facet = searchString.substring(startIndex, endIndex); // e.g. publisher:
    const len = searchString.length;
    // Handle corner case of nothing following the facet's "colon".
    if (len === endIndex) {
        return { part: facet, end: endIndex };
    }
    // Start looking for the value of the facet.
    let start = endIndex;
    let end: number;
    let facetPart: string;
    if (searchString[start] === '"') {
        // handle double quote subcase
        start++; // don't include the quotes in our result
        let first = start;
        let quoteCount = 0;
        do {
            end = searchString.indexOf('"', first);
            if (end < 0) {
                // no closing quote, so just use the rest of the string
                end = len;
                break;
            } else if (end > first && searchString[end - 1] === "\\") {
                // skip escaped quote
                first = end + 1;
                ++quoteCount;
                continue;
            } else {
                break;
            }
        } while (true);
        facetPart = searchString.substring(start, end);
        if (end < len && searchString[end] === '"') {
            end++;
        }
        if (quoteCount > 0) facetPart = facetPart.replace(/\\"/g, '"');
    } else {
        end = searchString.indexOf(" ", start);
        if (end < 0) {
            end = len;
        }
        facetPart = searchString.substring(start, end);
    }
    return { part: facet + facetPart, end };
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
                    params.where[facetLabel] = regex(facetValue);
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
        params.where.langPointers = {
            $inQuery: {
                where: { isoCode: f.language },
                className: "language",
            },
        };
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
    switch (f.inCirculation) {
        case undefined:
        case BooleanOptions.Yes:
            params.where.inCirculation = { $in: [true, null] };
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
    switch (f.draft) {
        case BooleanOptions.Yes:
            params.where.draft = true;
            break;
        case undefined:
        case BooleanOptions.No:
            params.where.draft = { $in: [false, null] };
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
    switch (f.rebrand) {
        case BooleanOptions.Yes:
            params.where.rebrand = true;
            break;
        case BooleanOptions.No:
            // can't use false because old records have undefined. Undefined and false both mean NOT branded. So we query for "not true".
            params.where.rebrand = { $ne: true };
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

export async function deleteBook(id: string) {
    return axios.delete(`${getConnection().url}classes/books/${id}`, {
        headers: getConnection().headers,
    });
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
