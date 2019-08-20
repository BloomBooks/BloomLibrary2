import React, { Component } from "react";
import useAxios from "@use-hooks/axios";
import { IFilter } from "../IFilter";
import { css, cx } from "emotion";
import { AxiosResponse } from "axios";

const header = {
    "Content-Type": "text/json",
    "X-Parse-Application-Id": "R6qNTeumQXjJCMutAJYAwPtip1qBulkFyLefkCE5",
    "X-Parse-REST-API-Key": "bAgoDIISBcscMJTTAY4mBB2RHLfkowkqMBMhQ1CD"
};

export function useGetBookCount(filter: IFilter) {
    return useLibraryQuery("books", { limit: 0, count: 1 }, filter);
}
export function useGetLanguageInfo(language: string) {
    return useAxios({
        url: `https://bloom-parse-server-production.azurewebsites.net/parse/classes/language`,
        method: "GET",
        trigger: "true",
        options: {
            headers: header,
            params: {
                where: { isoCode: language },
                keys: "isoCode,name,usageCount,bannerImageUrl"
            }
        }
    });
}
export function useGetBookshelves(category?: string) {
    return useAxios({
        url: `https://bloom-parse-server-production.azurewebsites.net/parse/classes/bookshelf`,
        method: "GET",
        trigger: "true",
        options: {
            headers: header,
            params: {
                where: { category: category },
                keys: "englishName,key"
            }
        }
    });
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
        url: `https://bloom-parse-server-production.azurewebsites.net/parse/classes/${queryClass}`,
        method: "GET",
        // there is an inner useEffect, and it looks at this. We want to rerun whenever the query changes (duh).
        trigger: JSON.stringify(params) + JSON.stringify(filter),
        options: {
            headers: header,
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
    // language {"where":{"langPointers":{"$inQuery":{"where":{"isoCode":"en"},"className":"language"}},"inCirculation":{"$in":[true,null]}},"limit":0,"count":1
    // topic {"where":{"tags":{"$in":["topic:Agriculture","Agriculture"]},"license":{"$regex":"^\\Qcc\\E"},"inCirculation":{"$in":[true,null]}},"include":"langPointers,uploader","keys":"$score,title,tags,baseUrl,langPointers,uploader","limit":10,"order":"title",
    //{where: {search: {$text: {$search: {$term: "opposites"}}}, license: {$regex: "^\Qcc\E"},…},…}

    // doing a clone here because the semantics of deleting language from filter were not what was expected.
    // it removed the "language" param from the filter parameter itself.
    params.where = filter ? JSON.parse(JSON.stringify(filter)) : {};

    /* ----------------- TODO ---------------------

            This needs to be rewritten so that we can combine  things like topic and bookshelf and language

    --------------------------------------------------*/
    if (!!filter.search && filter.search.length > 0) {
        params.where.search = {};
        params.where.search = {
            $text: { $search: { $term: filter.search.trim() } }
        };
    }
    // if filter.language is set, add the query needed to restrict books to those with that language
    if (filter.language != null) {
        delete params.where.language; // remove that, we need to make it more complicated because we need a join.
        params.where.langPointers = {
            $inQuery: {
                where: { isoCode: filter.language },
                className: "language"
            }
        };
    }
    if (filter.topic != null) {
        delete params.where.topic;
        params.where.tags = {
            $in: [
                "topic:" + filter.topic /* new style */,
                filter.topic /*old style, which I suspect is all gone*/
            ]
        };
    }
    if (filter.otherTags != null) {
        delete params.where.otherTags;
        params.where.tags = filter.otherTags;
    }
    if (filter.bookShelfCategory != null) {
        delete params.where.bookShelfCategory;
    }
    //tags: {$all: ["bookshelf:Enabling Writers Workshops/Bangladesh_Dhaka Ahsania Mission",
    if (filter.bookshelf != null) {
        delete params.where.bookshelf;
    }

    const tagParts = [];
    if (filter.bookshelf) {
        tagParts.push("bookshelf:" + filter.bookshelf);
    }
    if (filter.topic) {
        tagParts.push("topic:" + filter.topic);
    }
    if (tagParts.length > 0) {
        params.where.tags = {
            $all: tagParts
        };
    }

    if (filter.feature != null) {
        delete params.where.feature;
        params.where.features = filter.feature; //my understanding is that this means it just has to contain this, could have others
    }
    if (filter.inCirculation != null) {
        delete params.where.inCirculation;
        params.where.inCirculation = { $in: [filter.inCirculation, null] };
    } else {
        params.where.inCirculation = { $in: [true, null] };
    }
    return params;
}

export function getResultsOrMessageElement(queryResult: IAxiosAnswer) {
    const { response, loading, error, reFetch } = queryResult;
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
    const { response, loading, error, reFetch } = queryResult;
    if (loading || !response) return "";
    if (error) return "error";
    return response["data"]["count"].toString();
}
