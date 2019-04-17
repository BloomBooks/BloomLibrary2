import React, { Component } from "react";
import useAxios from "@use-hooks/axios";
import { IFilter } from "../Router";

//{"where":{"inCirculation":{"$in":[true,null]}},"limit":0,"count":1
export function useGetBookCount(filter: IFilter) {
    return useQueryBlorgClass("books", { limit: 0, count: 1 }, filter);
}
export function useQueryBlorgClass(
    queryClass: string,
    params: {},
    filter: IFilter
) {
    return useAxios({
        url: `https://bloom-parse-server-production.azurewebsites.net/parse/classes/${queryClass}`,
        method: "GET",
        trigger: "true",
        options: {
            headers: {
                "Content-Type": "text/json",
                "X-Parse-Application-Id":
                    "R6qNTeumQXjJCMutAJYAwPtip1qBulkFyLefkCE5",
                "X-Parse-REST-API-Key":
                    "bAgoDIISBcscMJTTAY4mBB2RHLfkowkqMBMhQ1CD"
            },

            params: constructParseDBQuery(params, filter)
        }
    });
}

function constructParseDBQuery(params: any, filter: IFilter): object {
    // language {"where":{"langPointers":{"$inQuery":{"where":{"isoCode":"en"},"className":"language"}},"inCirculation":{"$in":[true,null]}},"limit":0,"count":1
    // topic {"where":{"tags":{"$in":["topic:Agriculture","Agriculture"]},"license":{"$regex":"^\\Qcc\\E"},"inCirculation":{"$in":[true,null]}},"include":"langPointers,uploader","keys":"$score,title,tags,baseUrl,langPointers,uploader","limit":10,"order":"title",

    // doing a clone here because the semantics of deleting language from filter were not what was expected.
    // it removed the "language" param from the filter paramter itself.
    params.where = filter ? JSON.parse(JSON.stringify(filter)) : {};

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
                filter.topic /*old style*/
            ]
        };
    }

    //tags: {$in: ["topic:Agriculture", "Agriculture"]}

    params.where.inCirculation = { $in: [true, null] };
    return params;
}

export function getResultsOrMessageElement(queryResult: any) {
    const { response, loading, error, reFetch } = queryResult;
    if (loading)
        return { noResultsElement: <div>"loading..."</div>, results: null };
    if (error)
        return {
            noResultsElement: <div>{"error: " + error.message}</div>,
            results: null
        };
    if (!response)
        return { noResultsElement: <div>"response null!"</div>, results: null };
    return {
        noResultsElement: null,
        results: response["data"]["results"],
        count: response["data"]["count"]
    };
}
