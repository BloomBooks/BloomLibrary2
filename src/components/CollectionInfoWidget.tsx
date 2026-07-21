import { css } from "@emotion/react";
import React from "react"; // see https://github.com/emotion-js/emotion/issues/1156

import FilterTiltShiftIcon from "@material-ui/icons/FilterTiltShift";

import { BooleanOptions, IFilter } from "FilterTypes";
import { ICollection } from "../model/ContentInterfaces";
import { kContentfulSpace } from "../ContentfulContext";
import { getFilterForCollectionAndChildren } from "../model/Collections";
import { useShowTroubleshootingStuff } from "../Utilities";

export const CollectionInfoWidget: React.FunctionComponent<{
    collection: ICollection;
}> = (props) => {
    const [showTroubleshootingStuff] = useShowTroubleshootingStuff();
    try {
        if (!showTroubleshootingStuff) return null;
        const collectionInfo = props.collection
            ? `UrlKey = ${props.collection.urlKey}\r\nSort Order = ${
                  props.collection.orderingScheme ||
                  "(not set; using createdAt, or search score)"
              }`
            : "";
        const filter = props.collection.filter
            ? props.collection.filter
            : getFilterForCollectionAndChildren(props.collection!);
        return (
            <span
                css={css`
                    user-select: none;
                    position: absolute;
                `}
                title={`This widget shows because you are a moderator.\r\n${
                    props.collection.contentfulId
                        ? "Click the icon to edit in Contentful\r\n"
                        : ""
                }${collectionInfo}\r\n${filterInfoString(
                    filter
                )}\r\nDuplicate Removal = ${
                    props.collection.duplicateBookFilterName
                }\r\nContext Lang = ${props.collection.contextLangTag}`}
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
                        if (props.collection.contentfulId)
                            window
                                .open(
                                    `https://app.contentful.com/spaces/${kContentfulSpace}/entries/` +
                                        props.collection.contentfulId,

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
