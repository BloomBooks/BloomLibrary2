import css from "@emotion/css/macro";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import FilterTiltShiftIcon from "@material-ui/icons/FilterTiltShift";

import { BooleanOptions, IFilter } from "../IFilter";
import { ICollection } from "../model/ContentInterfaces";
import { useGetUserIsModerator } from "../connection/LoggedInUser";
import { kContentfulSpace } from "../ContentfulContext";

export const CollectionInfoWidget: React.FunctionComponent<{
    // provide the collection if you have it
    collection?: ICollection;
    // else we'll take just a filter
    filter?: IFilter;
}> = (props) => {
    const isModerator = useGetUserIsModerator();
    try {
        if (!isModerator) return null;
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
                title={`This widget shows because you are a moderator.\r\n${
                    props.collection?.contentfulId
                        ? "Click the icon to edit in Contentful\r\n"
                        : ""
                }${collectionInfo}\r\n${filterInfoString(filter)}`}
            >
                <FilterTiltShiftIcon
                    css={css`
                        width: 6px;
                        margin-left: 10px;
                        // this might not be worth keeping forever, but at the moment we're going through
                        // deciding which collections should allow rebrands, so it's helpful.
                        * {
                            color: ${filter?.rebrand === BooleanOptions.No
                                ? "red"
                                : "#1ac8eb"} !important;
                        }
                    `}
                    fontSize={"small"}
                    onClick={() => {
                        if (props.collection?.contentfulId)
                            window
                                .open(
                                    `https://app.contentful.com/spaces/${kContentfulSpace}/entries/` +
                                        props.collection?.contentfulId,

                                    "_blank"
                                )
                                ?.focus();
                        else
                            window.alert(
                                "TODO: Contentful id isn't available here yet. Try going to the page itself."
                            );
                    }}
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
