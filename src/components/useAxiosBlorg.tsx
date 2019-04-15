import React, { Component } from "react";
import useAxios from "@use-hooks/axios";
import { IFilter } from "../Router";

// just wraps up the useAxios call with some commone stuff
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
    params.where = filter || "";
    // if filter.language is set, add the query needed to restrict books to those with that language
    if (filter.language != null) {
        params.where.langPointers = {
            $inQuery: {
                where: { isoCode: filter.language || "" },
                className: "language"
            }
        };
    }
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
    return { noResultsElement: null, results: response["data"]["results"] };
}
