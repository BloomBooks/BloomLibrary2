// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React, { useState } from "react";
import { GridControl } from "../Grid/GridControl";
import { IFilter } from "../../IFilter";
import { observable } from "mobx";
import { AssignPublisherPanel } from "./AssignPublisherPanel";
import { Filter as GridFilter } from "@devexpress/dx-react-grid";
import { AddTagPanel } from "./AddTagPanel";
import { AddBookshelfPanel } from "./AddBookshelfPanel";

// The Bulk Edit page is for moderators; it has a series of panels for making changes, followed by a grid
// for selecting what books will be changed.
export const BulkEditPage: React.FunctionComponent<{}> = () => {
    const [refreshIndex, setRefreshIndex] = useState(0);
    return (
        <div
            css={css`
                margin-left: 10px;
            `}
        >
            <h1>Bulk Edit Page</h1>
            <AssignPublisherPanel
                backgroundColor="#daffb6"
                filterHolder={staticCurrentFilter}
                refresh={() => setRefreshIndex(refreshIndex + 1)}
            />
            <AddTagPanel
                backgroundColor="lightblue"
                filterHolder={staticCurrentFilter}
                refresh={() => setRefreshIndex(refreshIndex + 1)}
            />
            <AddBookshelfPanel
                backgroundColor="lightyellow"
                filterHolder={staticCurrentFilter}
                refresh={() => setRefreshIndex(refreshIndex + 1)}
            />
            <GridControl
                showFilterSpec={true}
                // the need to preserve the grid's filter state this way this is related to the problem described on the comment above class FilterHolder
                initialGridFilters={staticCurrentFilter.gridColumnFilters}
                setCurrentFilter={(
                    f: IFilter,
                    gridColumnFilters: GridFilter[]
                ) => {
                    staticCurrentFilter.completeFilter = f;
                    staticCurrentFilter.gridColumnFilters = gridColumnFilters;
                }}
            />
        </div>
    );
};

// This is a kludge but something in GridControlInternal is apparently causing it to completely reset if
// any state changes in its parent (BulkEditPage). So for example you can't type in a filter header field.
// To work around this, we keep the state *outside* of BulkEditPage, and let any of its children that need
// to know the current filter instead subscribe to it using mobx.observer.
export class FilterHolder {
    @observable
    public completeFilter: IFilter = {}; //includes the search box
    public gridColumnFilters: GridFilter[] = []; //just the filters from the headers of the columns
}
const staticCurrentFilter: FilterHolder = new FilterHolder();
