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
import { ChangeColumnValueForAllBooksInFilter } from "./BulkChangeFunctions";

export const AssignPublisherPanel: React.FunctionComponent<{
    filterHolder: FilterHolder;
    refresh: () => void;
}> = observer(props => {
    return (
        <BulkEditPanel
            panelLabel="Change Publisher"
            newValueLabel="New Publisher"
            actionButtonLabel="Change Publisher"
            performChangesToAllMatchingBooks={ChangePublisher}
            {...props}
        />
    );
});

async function ChangePublisher(
    filter: IFilter,
    publisher: string,
    refresh: () => void
) {
    ChangeColumnValueForAllBooksInFilter(
        filter,
        publisher,
        "publisher",
        refresh
    );
}
