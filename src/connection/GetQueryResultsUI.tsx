import React from "react";
import { IAxiosAnswer } from "./LibraryQueryHooks";

export function getNoResultsElement() {
    return (
        <div>
            {/* without this we don't get a line and then the screen jumps */}
            &nbsp;
        </div>
    );
}

export function getResultsOrMessageElement(queryResult: IAxiosAnswer) {
    const { response, loading, error } = queryResult;
    if (loading || !response)
        return {
            noResultsElement: getNoResultsElement(),
            results: null,
        };
    if (error)
        return {
            noResultsElement: <div>{"error: " + error.message}</div>,
            results: null,
        };
    // if (!response)
    //     return { noResultsElement: <div>"response null!"</div>, results: null };
    return {
        noResultsElement: null,
        results: response["data"]["results"],
        count: response["data"]["count"],
    };
}
