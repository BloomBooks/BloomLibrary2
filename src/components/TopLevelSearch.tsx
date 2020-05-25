import React from "react";
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import { useSearchBooks } from "../connection/LibraryQueryHooks";
import { Breadcrumbs } from "./Breadcrumbs";
import { ListOfBookGroups } from "./ListOfBookGroups";
import { useLocation } from "react-router-dom";
import QueryString from "qs";
import { LevelGroups } from "./LevelGroups";
import { ICollection2 } from "../model/Collections";

export const TopLevelSearch: React.FunctionComponent<{
    collection: ICollection2;
    title?: string;
}> = (props) => {
    const location = useLocation();
    const search = useSearchBooks(
        {
            limit: 0, // we only want the count
        },
        props.collection.filter
    );
    const queryParams = QueryString.parse(location.search.substring(1));
    const title = (props.title ?? 'Books matching "{0}"').replace(
        "{0}",
        queryParams.search
    );
    // Enhance: the 20px here matches various other things, particularly ListOfBookGroups;
    // eventually we should capture this.
    return (
        <React.Fragment>
            <div
                css={css`
                    padding-left: 20px;
                `}
            >
                <Breadcrumbs />
            </div>
            <ListOfBookGroups>
                <h1>
                    {title}
                    <span
                        css={css`
                            font-size: 9pt;
                            color: gray;
                            margin-left: 1em;
                        `}
                    >
                        {search.totalMatchingRecords}
                    </span>
                </h1>
                <LevelGroups collection={props.collection} />
            </ListOfBookGroups>
        </React.Fragment>
    );
};
