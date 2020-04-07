import React from "react";
import { IFilter } from "../../IFilter";
import { observer } from "mobx-react";
import { FilterHolder } from "./BulkEditPage";
import { BulkEditPanel } from "./BulkEditPanel";
import { ChangeColumnValueForAllBooksInFilter } from "./BulkChangeFunctions";

export const AssignPublisherPanel: React.FunctionComponent<{
    filterHolder: FilterHolder;
    backgroundColor: string;
    refresh: () => void;
}> = observer((props) => {
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
