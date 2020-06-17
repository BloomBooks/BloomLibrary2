// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */
import React from "react";

import { Breadcrumbs } from "../Breadcrumbs";
import { GridControl } from "./GridControl";
import { IFilter } from "../../IFilter";
import { useDocumentTitle } from "../Routes";

export const GridPage: React.FunctionComponent<{ filters: string }> = (
    props
) => {
    useDocumentTitle("Grid");
    let contextFilter: IFilter = {};
    if (props.filters && props.filters.startsWith(":search:")) {
        const search = props.filters.split("/")[0].substring(":search:".length);
        contextFilter = { search };
    }
    return (
        <div>
            <div
                css={css`
                    margin-top: 5px;
                    margin-left: 22px;
                    display: flex;
                    justify-content: space-between;
                `}
            >
                <Breadcrumbs />
            </div>
            <GridControl contextFilter={contextFilter} />
        </div>
    );
};
