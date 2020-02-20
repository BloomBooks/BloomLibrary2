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
            params: params
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

export function useGetBookshelves(category?: string) {
    return useLibraryQuery("bookshelf", {
        where: category ? { category: category } : null,
        keys: "englishName,key"
    });
}

export function useGetLanguageInfo(language: string) {
    return useLibraryQuery("language", {
        where: { isoCode: language },
        keys: "isoCode,name,usageCount,bannerImageUrl"
    });
}

export function useGetBookCount(filter: IFilter) {
    return useBookQuery({ limit: 0, count: 1 }, filter);
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
                    "title,baseUrl,license,licenseNotes,summary,copyright,harvestState," +
                    "tags,pageCount,show,credits,country,features,internetLimits," +
                    "librarianNote,uploader,langPointers",
                include: "librarianNote,uploader,langPointers"
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
        response["data"]["results"][0],
        bookId
    );

    // const parts = detail.tags.split(":");
    // const x = parts.map(p => {tags[(p[0]) as string] = ""});

    // return parts[0] + "-" + parts[1];
    // detail.topic =

    return detail;
}

// we just want a better name
export interface IAxiosAnswer extends IReturns<any> {}

// May set param.order to "titleOrScore" to indicate that books should be
// sorted by title unless the search is a keyword search that makes a ranking
// score available. For this to work, params must also specify keys.
export function useBookQuery(
    params: {}, // this is the order, which fields, limits, etc.

    filter: IFilter // this is *which* records to return
): IAxiosAnswer {
    const { tags } = useContext(CachedTablesContext);

    return useAxios({
        url: `${getConnection().url}classes/books`,
        method: "GET",
        // there is an inner useEffect, and it looks at this. We want to rerun whenever the query changes (duh).
        // Also, the very first time this runs, we will need to run again once we get
        // the list of known tags.
        trigger:
            JSON.stringify(params) +
            JSON.stringify(filter) +
            JSON.stringify(!!tags),
        options: {
            headers: getConnection().headers,
            params: constructParseBookQuery(params, filter, tags)
        }
    });
}

// Note that we also have a full-fledge "book" class, so why aren't we just using that?
// The is because Book class is basically everything we might want to know about a book,
// and it is used in the BookDetail screen. In contrast, this is just some type wrapping
// around the raw REST result, used to quickly make book cards.
export interface IBasicBookInfo {
    objectId: string;
    baseUrl: string;
    harvestState?: string;
    title: string;
    languages: ILanguage[];
}

export interface ISearchBooksResult {
    waiting: boolean;
    totalMatchingRecords: number;
    errorString: string | null;
    books: IBasicBookInfo[];
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
    const bookCountStatus: IAxiosAnswer = useBookQuery(
        { count: 1 }, // we're just looking for one number here, the count
        filter
    );
    const bookResultsStatus: IAxiosAnswer = useBookQuery(params, filter);
    const simplifiedResultStatus = processAxiosStatus(bookResultsStatus);
    const simplifiedCountStatus = processAxiosStatus(bookCountStatus);

    const typeSafeBookRecords: IBasicBookInfo[] = simplifiedResultStatus.books.map(
        (rawFromREST: any) => {
            const b: IBasicBookInfo = { ...rawFromREST };
            b.languages = rawFromREST.langPointers;
            return b;
        }
    );

    return {
        totalMatchingRecords: simplifiedCountStatus.count,
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
// treated as additional search facets, usually tags. Known possible tags are
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
    tagOptions1?: string[]
): { keywords: string; specialParts: string[] } {
    if (!tagOptions1) {
        // should only happen during an early render that happens before we get
        // the results of the tag query.
        return { keywords: input, specialParts: [] };
    }
    const tagOptions = ["uploader:", "copyright:", ...tagOptions1];
    // Start with the string with extra spaces (doubles and following colon) removed.
    let keywords = input
        .replace(/ {2}/g, " ")
        .trim()
        .replace(/: /g, ":");
    const specialParts: string[] = [];
    // Each iteration attempts to find and remove a special part.
    for (;;) {
        let gotOne = false;
        const keywordsLc = keywords.toLowerCase();
        for (const tag of tagOptions) {
            const tagLc = tag.toLowerCase();
            const index = keywordsLc.indexOf(tagLc);
            if (index < 0) continue;
            gotOne = true;
            let end = index + tag.length;
            const specialTag = tag === "uploader:" || tag === "copyright:";
            if (specialTag) {
                end = keywords.indexOf(" ", end);
                if (end < 0) {
                    end = keywords.length;
                }
            }
            let part = keywords.substring(index, end);
            // If tagOptions contains an exact match for the part, we'll keep that case.
            // So for example if we have both system:Incoming and system:incoming, it's
            // possible to search for either. Otherwise, we want to switch to the case
            // that actually occurs in the database, because tag searches are case sensitive
            // and won't match otherwise.
            if (!specialTag && tagOptions.indexOf(part) < 0) {
                part = tag;
            }
            specialParts.push(part);
            keywords = (
                keywords.substring(0, index) +
                " " +
                keywords.substring(end, keywords.length)
            )
                // I'm not sure this cleanup matters to the mongo search engine, but
                // it makes results more natural and predictable for testing
                .replace(/\s+/, " ") // easier than trying to adjust endpoints to get exactly one space
                .trim(); // in case we removed from start or end
            break;
        }
        if (!gotOne) break;
    }

    return { keywords, specialParts };
}

export function constructParseBookQuery(
    params: any,
    filter: IFilter,
    tagOptions?: string[]
): object {
    // todo: I don't know why this is underfined
    const f = filter ? filter : {};

    // language {"where":{"langPointers":{"$inQuery":{"where":{"isoCode":"en"},"className":"language"}},"inCirculation":{"$in":[true,null]}},"limit":0,"count":1
    // topic {"where":{"tags":{"$in":["topic:Agriculture","Agriculture"]},"license":{"$regex":"^\\Qcc\\E"},"inCirculation":{"$in":[true,null]}},"include":"langPointers,uploader","keys":"$score,title,tags,baseUrl,langPointers,uploader","limit":10,"order":"title",
    //{where: {search: {$text: {$search: {$term: "opposites"}}}, license: {$regex: "^\Qcc\E"},…},…}

    // doing a clone here because the semantics of deleting language from filter were not what was expected.
    // it removed the "language" param from the filter parameter itself.
    params.where = filter ? JSON.parse(JSON.stringify(filter)) : {};

    /* ----------------- TODO ---------------------

            This needs to be rewritten so that we can combine  things like topic and bookshelf and language

    --------------------------------------------------*/
    const tagParts = [];
    if (!!f.search) {
        const { keywords, specialParts } = splitString(
            filter.search!,
            tagOptions
        );

        for (const part of specialParts) {
            const keyVal = part.split(":").map(p => p.trim());
            switch (keyVal[0]) {
                case "uploader":
                    params.where.uploader = {
                        $inQuery: {
                            where: {
                                email: { $regex: keyVal[1], $options: "i" }
                            },
                            className: "_User"
                        }
                    };
                    break;
                case "copyright":
                    params.where.copyright = {
                        $regex: keyVal[1],
                        $options: "i"
                    };
                    break;
                default:
                    tagParts.push(part);
                    break;
            }
        }
        if (keywords.length > 0) {
            params.where.search = {
                $text: { $search: { $term: keywords } }
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
    // topic is handled below. This older version is not compatible with the possiblity of other topics.
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
        // f.otherTags is currently always a single tag, if it's present at all.
        tagParts.push(f.otherTags);
    }
    // we can search for bookshelves by category (org, project, etc) using useGetBookshelves(). But
    // we cannot, here, filter books by category. We cannot say "give me all the books that are listed in all project bookshelves"
    if (f.bookShelfCategory != null) {
        delete params.where.bookShelfCategory;
    }

    /* In  our Parse DB Bookshelves are just another kind of tag. So convert any bookshelf parameter into the right tag query */

    //tags: {$all: ["bookshelf:Enabling Writers Workshops/Bangladesh_Dhaka Ahsania Mission",
    if (f.bookshelf != null) {
        delete params.where.bookshelf;
    }

    if (f.bookshelf) {
        tagParts.push("bookshelf:" + f.bookshelf);
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
