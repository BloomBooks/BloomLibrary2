import React from "react";
import useAxios from "@use-hooks/axios";
import { IFilter } from "../IFilter";
import { css } from "emotion";
import { AxiosResponse } from "axios";
import { getConnection } from "./Connection";
import { ShowSettings } from "../components/HarvesterArtifactUserControl/ShowSettings";

export function useGetBookCount(filter: IFilter) {
    return useLibraryQuery("books", { limit: 0, count: 1 }, filter);
}
export function useGetLanguageInfo(language: string) {
    return useAxios({
        url: `${getConnection().url}classes/language`,
        method: "GET",
        trigger: "true",
        options: {
            headers: getConnection().headers,
            params: {
                where: { isoCode: language },
                keys: "isoCode,name,usageCount,bannerImageUrl"
            }
        }
    });
}
export function useGetBookshelves(category?: string) {
    return useAxios({
        url: `${getConnection().url}classes/bookshelf`,
        method: "GET",
        trigger: "true",
        options: {
            headers: getConnection().headers,
            params: {
                where: { category: category },
                keys: "englishName,key"
            }
        }
    });
}

export interface IBookDetail {
    id: string;
    title: string;
    summary: string;
    license: string;
    baseUrl: string;
    copyright: string;
    credits: string;
    pageCount: string;
    tags: Array<string>;
    harvesterLog: string;
    harvestState: string;
    show: {
        pdf: ShowSettings | undefined;
        epub: ShowSettings | undefined;
        bloomReader: ShowSettings | undefined;
        readOnline: ShowSettings | undefined;
    };
}

export function useGetBookDetail(
    bookId: string
): IBookDetail | undefined | null {
    const { response, loading, error } = useAxios({
        url: `${getConnection().url}classes/books`,
        method: "GET",
        trigger: "true",
        options: {
            headers: getConnection().headers,
            params: {
                where: { objectId: bookId },
                keys:
                    "title,baseUrl,license,summary,copyright,harvestState,tags,pages,show"
                //how to get these? ,include: "langPointers,uploader"
            }
        }
    });

    if (loading || !response) return undefined;
    if (error) return null;
    const detail: IBookDetail = response["data"]["results"][0];

    // this is kind of a dummy thing just so that I have something to show in the log, and to trigger
    // UI that would show if there was a problem.
    switch (detail.harvestState) {
        case "New":
            detail.harvesterLog =
                "Warning: this book has not yet been harvested.";
            break;
        case "Updated":
            detail.harvesterLog =
                "Warning: this book was re-uploaded and is now waiting to be harvested";
            break;
        default:
            detail.harvesterLog = "";
    }

    // const parts = detail.tags.split(":");
    // const x = parts.map(p => {tags[(p[0]) as string] = ""});

    // return parts[0] + "-" + parts[1];
    // detail.topic =
    detail.id = bookId;
    return detail;
}
export function useTopicList() {
    return useLibraryQuery("tag", { limit: 1000, count: 1000 }, {});
}
interface IAxiosAnswer {
    response: null | AxiosResponse;
    error: null | Error;
    loading: boolean;
    query: () => number;
    reFetch: () => number;
}
export function useLibraryQuery(
    queryClass: string,
    params: {},
    filter: IFilter
): IAxiosAnswer {
    return useAxios({
        url: `${getConnection().url}classes/${queryClass}`,
        method: "GET",
        // there is an inner useEffect, and it looks at this. We want to rerun whenever the query changes (duh).
        trigger: JSON.stringify(params) + JSON.stringify(filter),
        options: {
            headers: getConnection().headers,
            params: constructParseDBQuery(params, filter)
        }
    });
}
export interface ISearchBooksResult {
    waiting: boolean;
    totalMatchingRecords: number;
    errorString: string | null;
    results: [];
}
// the idea is for this to be higher level than useQueryLibrary. Initially
// with a separate count for the full number, but eventually with paging.
export function useSearchBooks(
    params: {},
    filter: IFilter
): ISearchBooksResult {
    const countStatus: IAxiosAnswer = useLibraryQuery(
        "books",
        { count: 1 },
        filter
    );
    const resultStatus: IAxiosAnswer = useLibraryQuery("books", params, filter);
    const simplifiedResultStatus = processAxiosStatus(resultStatus);
    const simplifiedCountStatus = processAxiosStatus(countStatus);

    return {
        totalMatchingRecords: simplifiedCountStatus.count,
        errorString: simplifiedResultStatus.error
            ? simplifiedResultStatus.error.message
            : null,
        results: simplifiedResultStatus.results,
        waiting: simplifiedResultStatus.waiting
    };
}
interface ISimplifiedAxiosResult {
    results: [];
    count: number;
    error: Error | null;
    waiting: boolean;
}
function processAxiosStatus(answer: IAxiosAnswer): ISimplifiedAxiosResult {
    if (answer.error)
        return {
            count: -2,
            results: [],
            error: answer.error,
            waiting: false
        };
    return {
        results:
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

function constructParseDBQuery(params: any, filter: IFilter): object {
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
    if (!!f.search && f.search.length > 0) {
        params.where.search = {};
        params.where.search = {
            $text: { $search: { $term: f.search.trim() } }
        };
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
    if (f.topic != null) {
        delete params.where.topic;
        params.where.tags = {
            $in: [
                "topic:" + f.topic /* new style */,
                f.topic /*old style, which I suspect is all gone*/
            ]
        };
    }
    if (f.otherTags != null) {
        delete params.where.otherTags;
        params.where.tags = f.otherTags;
    }
    if (f.bookShelfCategory != null) {
        delete params.where.bookShelfCategory;
    }
    //tags: {$all: ["bookshelf:Enabling Writers Workshops/Bangladesh_Dhaka Ahsania Mission",
    if (f.bookshelf != null) {
        delete params.where.bookshelf;
    }

    const tagParts = [];
    if (f.bookshelf) {
        tagParts.push("bookshelf:" + f.bookshelf);
    }
    if (f.topic) {
        tagParts.push("topic:" + f.topic);
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

export function getResultsOrMessageElement(queryResult: IAxiosAnswer) {
    const { response, loading, error } = queryResult;
    if (loading || !response)
        return {
            noResultsElement: (
                <div
                    className={css`
                        background-color: lightgray;
                        width: 100px;
                        height: 20px;
                    `}
                />
            ),
            results: null
        };
    if (error)
        return {
            noResultsElement: <div>{"error: " + error.message}</div>,
            results: null
        };
    // if (!response)
    //     return { noResultsElement: <div>"response null!"</div>, results: null };
    return {
        noResultsElement: null,
        results: response["data"]["results"],
        count: response["data"]["count"]
    };
}

export function getCountString(queryResult: any): string {
    const { response, loading, error } = queryResult;
    if (loading || !response) return "";
    if (error) return "error";
    return response["data"]["count"].toString();
}
