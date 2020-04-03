// this engages a babel macro that does cool emotion stuff (like source maps). See https://emotion.sh/docs/babel-macros
import css from "@emotion/css/macro";
// these two lines make the css prop work on react elements
import { jsx } from "@emotion/core";
/** @jsx jsx */

import React from "react";
import { IFilter } from "../../IFilter";
import { observer } from "mobx-react";
import { FilterHolder } from "./BulkEditPage";
import { BulkEditPanel } from "./BulkEditPanel";
import { AddTagAllBooksInFilter } from "./BulkChangeFunctions";

export const AddTagPanel: React.FunctionComponent<{
    filterHolder: FilterHolder;
    refresh: () => void;
    backgroundColor: string;
}> = observer(props => {
    return (
        <BulkEditPanel
            panelLabel="Add Tag"
            newValueLabel="New Tag"
            actionButtonLabel="Add Tag"
            performChangesToAllMatchingBooks={AddTag}
            {...props}
        />
    );
});

async function AddTag(filter: IFilter, tag: string, refresh: () => void) {
    AddTagAllBooksInFilter(filter, tag, refresh);
}
