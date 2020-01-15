import React from "react";
import { IAxiosAnswer } from "./LibraryQueryHooks";
import { css } from "@emotion/core";

export function getResultsOrMessageElement(queryResult: IAxiosAnswer) {
    const { response, loading, error } = queryResult;
    if (loading || !response)
        return {
            noResultsElement: (
                <div
                    css={css`
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
