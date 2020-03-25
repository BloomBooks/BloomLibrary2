import useAxios, { IReturns } from "@use-hooks/axios";
import { IFilter } from "../IFilter";
import { getConnection } from "./ParseServerConnection";
import { Book, createBookFromParseServerData } from "../model/Book";
import { useContext } from "react";
import { CachedTablesContext } from "../App";
import { getCleanedAndOrderedLanguageList, ILanguage } from "../model/Language";

// For things other than books, which should use `useBookQuery()`
function useLibraryQuery(queryClass: string, params: {}): IReturns<any> {
    return useAxios({
        url: `${getConnection().url}classes/${queryClass}`,
        method: "GET",
        trigger: "true",
        options: {
            headers: getConnection().headers,
            params
        }
    });
}
function useGetLanguagesList() {
    return useLibraryQuery("language", {
        keys: "name,englishName,usageCount,isoCode",
        limit: 10000,
        order: "-usageCount"
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
    const axiosResult = useLibraryQuery("tag", { limit: 1000, count: 1000 });

    if (axiosResult.response?.data?.results) {
        return axiosResult.response.data.results.map(
            (parseTag: { name: string }) => {
                return parseTag.name;
            }
        );
    }
    return [];
}
export function useGetTopicList() {
    // todo: this is going to give more than topics
    return useLibraryQuery("tag", { limit: 1000, count: 1000 });
}

export function useGetBookshelvesByCategory(
    category?: string
): IBookshelfResult[] {
    const axiosResult = useLibraryQuery("bookshelf", {
        where: category ? { category } : null
        //,keys: "englishName,key"
    });
    if (axiosResult.response?.data?.results) {
        const fullBookShelfDescriptions = axiosResult.response.data
            .results as IBookshelfResult[];

        return fullBookShelfDescriptions;
    } else return [];
}

export function useGetLanguageInfo(language: string): ILanguage[] {
    const axiosResult = useLibraryQuery("language", {
        where: { isoCode: language },
        keys: "isoCode,name,usageCount,bannerImageUrl"
    });

    if (axiosResult.response?.data?.results) {
        return axiosResult.response.data.results as ILanguage[];
    } else return [];
}

export function useGetBookCountRaw(filter: IFilter) {
    return useBookQueryInternal({ limit: 0, count: 1 }, filter);
}

export function useGetBookCount(filter: IFilter): number {
    const answer = useBookQueryInternal({ limit: 0, count: 1 }, filter);
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
                        objectId: bookId
                    }
                },
                // We don't really need all the fields of the related books, but I don't
                // see a way to restrict to just the fields we want. It's surely faster
                // to just get it all then get the bookids and then do separate queries to get their titles
                include: "books"
            }
        }
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
    return response["data"]["results"][0].books
        .filter((r: any) => r.objectId !== bookId) // don't return the book for which we're looking for related books.
        .map((r: any) => createBookFromParseServerData(r));
}
export function useGetBookDetail(bookId: string): Book | undefined | null {
    const { response, loading, error } = useAxios({
        url: `${getConnection().url}classes/books`,
        method: "GET",
        trigger: "true",
        options: {
            headers: getConnection().headers,
            params: {
                where: { objectId: bookId },
                keys:
                    "title,baseUrl,bookOrder,license,licenseNotes,summary,copyright,harvestState,harvestLog," +
                    "tags,pageCount,show,credits,country,features,internetLimits," +
                    "librarianNote,uploader,langPointers,importedBookSourceUrl,downloadCount," +
                    "harvestStartedAt,bookshelves",
                // fluff up fields that reference other tables
                include: "uploader,langPointers"
            }
        }
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

export function useGetBooksForGrid(
    filter: IFilter,
    limit: number,
    skip: number,
    // We only pay attention to the first one at this point, as that's all I figured out
    sortingArray: Array<{ columnName: string; descending: boolean }>
): { onePageOfMatchingBooks: Book[]; totalMatchingBooksCount: number } {
    //console.log("Sorts: " + sortingArray.map(s => s.columnName).join(","));
    const { tags } = useContext(CachedTablesContext);

    // Enhance: this only pays attention to the first one at this point, as that's all I figured out how to do
    let order = "";
    if (sortingArray?.length > 0) {
        order = sortingArray[0].columnName;
        if (sortingArray[0].descending) {
            order = "-" + order; // a preceding minus sign means descending order
        }
    }
    const query = constructParseBookQuery({}, filter, tags);
    //console.log("order: " + order);
    const { response, loading, error } = useAxios({
        url: `${getConnection().url}classes/books`,
        method: "GET",
        trigger:
            JSON.stringify(filter) +
            limit.toString() +
            skip.toString() +
            order.toString(),

        options: {
            headers: getConnection().headers,
            params: {
                limit,
                skip,
                order,

                keys:
                    "title,baseUrl,license,licenseNotes,summary,copyright,harvestState,harvestLog," +
                    "tags,pageCount,show,credits,country,features,internetLimits,bookshelves," +
                    "librarianNote,uploader,langPointers,importedBookSourceUrl,downloadCount,publisher",
                // fluff up fields that reference other tables
                include: "uploader,langPointers",
                ...query
            }
        }
    });
    const { response: countResponse } = useAxios({
        url: `${getConnection().url}classes/books`,
        method: "GET",
        trigger: JSON.stringify(filter),

        options: {
            headers: getConnection().headers,
            params: {
                limit: 0,
                count: 1,
                ...query
            }
        }
    });

    if (
        loading ||
        !response ||
        !response["data"] ||
        !response["data"]["results"] ||
        response["data"]["results"].length === 0 ||
        error
    ) {
        return { onePageOfMatchingBooks: [], totalMatchingBooksCount: 0 };
    }

    const books = response["data"]["results"].map((r: object) =>
        createBookFromParseServerData(r)
    );
    const count = countResponse ? countResponse["data"]["count"] : -1;
    return { onePageOfMatchingBooks: books, totalMatchingBooksCount: count };
}

// we just want a better name
export interface IAxiosAnswer extends IReturns<any> {}

// May set param.order to "titleOrScore" to indicate that books should be
// sorted by title unless the search is a keyword search that makes a ranking
// score available. For this to work, params must also specify keys.
function useBookQueryInternal(
    params: {}, // this is the order, which fields, limits, etc.

    filter: IFilter, // this is *which* records to return
    limit?: number, //pagination
    skip?: number //pagination
): IAxiosAnswer {
    const { tags } = useContext(CachedTablesContext);

    const finalParams = constructParseBookQuery(
        params,
        filter,
        tags,
        limit,
        skip
    );
    //console.log("finalParams: " + JSON.stringify(finalParams));
    return useAxios({
        url: `${getConnection().url}classes/books`,
        method: "GET",
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
            params: finalParams
        }
    });
}

export function useBookQuery(
    params: {},
    filter: IFilter,
    limit?: number, //pagination
    skip?: number //pagination
): IBasicBookInfo[] {
    const bookResultsStatus: IAxiosAnswer = useBookQueryInternal(
        params,
        filter,
        limit,
        skip
    );
    const simplifiedResultStatus = processAxiosStatus(bookResultsStatus);

    return simplifiedResultStatus.books.map((rawFromREST: any) => {
        const b: IBasicBookInfo = { ...rawFromREST };
        b.languages = rawFromREST.langPointers;
        return b;
    });
}

// Note that we also have a full-fledge "book" class, so why aren't we just using that?
// Book class, used in the BookDetail screen, is basically everything we might want to
// know about a book, and is more expensive to get and prepare. In contrast, this is just some type wrapping
// around the raw REST result, used to quickly make book cards & grid rows.
export interface IBasicBookInfo {
    objectId: string;
    baseUrl: string;
    harvestState?: string;
    // conceptually a date, but uploaded from parse server this is what it has.
    harvestStartedAt?: { iso: string } | undefined;
    title: string;
    languages: ILanguage[];
    features: string[];
    tags: string[];
    updatedAt?: string;
    license: string;
    copyright: string;
    pageCount: string;
    createdAt: string;
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
// May set param.order to "titleOrScore" to indicate that books should be
// sorted by title unless the search is a keyword search that makes a ranking
// score available. For this to work, params must also specify keys.
export function useSearchBooks(
    params: {}, // this is the order, which fields, limits, etc.
    filter: IFilter // this is *which* books to return
): ISearchBooksResult {
    const paramsWithCount = { ...params, count: 1 };
    const bookResultsStatus: IAxiosAnswer = useBookQueryInternal(
        paramsWithCount,
        filter
    );
    const simplifiedResultStatus = processAxiosStatus(bookResultsStatus);

    const typeSafeBookRecords: IBasicBookInfo[] = simplifiedResultStatus.books.map(
        (rawFromREST: any) => {
            const b: IBasicBookInfo = { ...rawFromREST };
            b.languages = rawFromREST.langPointers;
            return b;
        }
    );

    return {
        totalMatchingRecords: simplifiedResultStatus.count,
        errorString: simplifiedResultStatus.error
            ? simplifiedResultStatus.error.message
            : null,
        books: typeSafeBookRecords,
        waiting: simplifiedResultStatus.waiting
    };
}

function processAxiosStatus(answer: IAxiosAnswer): ISimplifiedAxiosResult {
    if (answer.error)
        return {
            count: -2,
            books: [],
            error: answer.error,
            waiting: false
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
        waiting: answer.loading
    };
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
    tagsFoundInDatabase?: string[]
): { otherSearchTerms: string; specialParts: string[] } {
    if (!tagsFoundInDatabase) {
        // should only happen during an early render that happens before we get
        // the results of the tag query.
        return { otherSearchTerms: input, specialParts: [] };
    }
    const facets = ["uploader:", "copyright:", "harvestState:"];

    const possibleParts = [...facets, ...tagsFoundInDatabase];
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
            if (isFacet) {
                end = otherSearchTerms.indexOf(" ", end);
                if (end < 0) {
                    end = otherSearchTerms.length;
                }
            }
            let part = otherSearchTerms.substring(index, end);
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

export function constructParseBookQuery(
    params: any,
    filter: IFilter,
    tagOptions?: string[],
    limit?: number, //pagination
    skip?: number //pagination
): object {
    // todo: I don't know why this is undefined
    const f = filter ? filter : {};

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

    const tagParts = [];
    const caseInsensitive = { $options: "i" };
    if (!!f.search) {
        const { otherSearchTerms, specialParts } = splitString(
            filter.search!,
            tagOptions
        );

        for (const part of specialParts) {
            const [facetLabel, facetValue] = part.split(":").map(p => p.trim());
            switch (facetLabel) {
                case "uploader":
                    params.where.uploader = {
                        $inQuery: {
                            where: {
                                email: {
                                    $regex: facetValue,
                                    ...caseInsensitive
                                }
                            },
                            className: "_User"
                        }
                    };
                    break;
                case "copyright":
                    params.where.copyright = {
                        $regex: facetValue,
                        ...caseInsensitive
                    };
                    break;
                case "harvestState":
                    params.where.harvestState = facetValue;
                    break;
                default:
                    tagParts.push(part);
                    break;
            }
        }
        if (otherSearchTerms.length > 0) {
            params.where.search = {
                $text: { $search: { $term: otherSearchTerms } }
            };
            if (params.order === "titleOrScore") {
                params.order = "$score";
                if (params.keys === undefined) {
                    throw new Error(
                        "params.keys must be set to use titleOrScore"
                    );
                }
                if (params.keys.indexOf("$score") < 0) {
                    params.keys = "$score," + params.keys;
                }
            }
        } else {
            delete params.where.search;
        }
    }

    if (params.order === "titleOrScore") {
        // We've passed the point where a Score search might be indicated. Use title
        params.order = "title";
    }
    // if f.language is set, add the query needed to restrict books to those with that language
    if (f.language != null) {
        delete params.where.language; // remove that, we need to make it more complicated because we need a join.
        params.where.langPointers = {
            $inQuery: {
                where: { isoCode: f.language },
                className: "language"
            }
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
        f.otherTags.split(",").forEach(t => tagParts.push(t));
    }
    // we can search for bookshelves by category (org, project, etc) using useGetBookshelves(). But
    // we cannot, here, filter books by category. We cannot say "give me all the books that are listed in all project bookshelves"
    if (f.bookShelfCategory != null) {
        delete params.where.bookShelfCategory;
    }

    if (f.topic) {
        tagParts.push("topic:" + f.topic);
        delete params.where.topic;
    }
    if (tagParts.length > 0) {
        params.where.tags = {
            $all: tagParts
        };
    }
    // allow regex searches on bookshelf. Handing for counting up, for example, all the books with bookshelf tags
    // that start with "Enabling Writers" (and then go on to list country and sub-project).
    if (filter.bookshelf) {
        delete params.where.bookshelf;
        params.where.bookshelves = {
            $regex: filter.bookshelf,
            ...caseInsensitive
        };
    }

    if (f.feature != null) {
        delete params.where.feature;
        params.where.features = f.feature; //my understanding is that this means it just has to contain this, could have others
    }
    if (f.inCirculation != null) {
        delete params.where.inCirculation;
        params.where.inCirculation = { $in: [f.inCirculation, null] };
    } else {
        params.where.inCirculation = { $in: [true, null] };
    }
    return params;
}

export function getCountString(queryResult: any): string {
    const { response, loading, error } = queryResult;
    if (loading || !response) return "";
    if (error) return "error";
    return response["data"]["count"].toString();
}
