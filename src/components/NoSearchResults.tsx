// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";
import { useTrack } from "../analytics/Analytics";

// This is displayed when the user types a search and there are no matches.
// It also reports this event to analytics.
export const NoSearchResults: React.FunctionComponent<{ match: string }> = (
    props
) => {
    useTrack("Search Failed", { match: props.match }, true);
    return (
        <div>{`No books in the library match the search "${props.match}"`}</div>
    );
};
