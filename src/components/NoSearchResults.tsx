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
