import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import FilterTiltShiftIcon from "@material-ui/icons/FilterTiltShift";

import { IFilter } from "../IFilter";
import { ICollection } from "../model/ContentInterfaces";
import { useGetLoggedInUser } from "../connection/LoggedInUser";

export const CollectionInfoWidget: React.FunctionComponent<{
    // provide the collection if you have it
    collection?: ICollection;
    // else we'll take just a filter
    filter?: IFilter;
}> = (props) => {
    const user = useGetLoggedInUser();
    try {
        if (!user || !user.moderator) return null;
        const collectionInfo = props.collection
            ? `UrlKey = ${props.collection.urlKey}`
            : "";
        const filter = props.filter ? props.filter : props.collection?.filter;
        return (
            <span
                css={css`
                    user-select: none;
                    position: absolute;
                `}
                title={`This widget shows because you are a moderator.\r\n${collectionInfo}\r\n${filterInfoString(
                    filter
                )}`}
            >
                <FilterTiltShiftIcon
                    css={css`
                        width: 6px;
                        margin-left: 10px;
                        color: #1ac8eb;
                    `}
                    fontSize={"small"}
                />
            </span>
        );
    } catch (e) {
        return null;
    }
};
function filterInfoString(filter?: IFilter): string {
    if (!filter) {
        return "Filter = not using a filter object.";
    }
    try {
        return `Filter = ${JSON.stringify(filter)}`;
    } catch (e) {
        return "There was an error creating filter info string.";
    }
}
