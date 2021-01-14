import React from "react";
import { IFilter } from "../../IFilter";
import { observer } from "mobx-react-lite";
import { FilterHolder } from "./BulkEditPage";
import { BulkEditPanel } from "./BulkEditPanel";
import { ChangeColumnValueForAllBooksInFilter } from "./BulkChangeFunctions";

export const AssignOriginalPublisherPanel: React.FunctionComponent<{
    filterHolder: FilterHolder;
    backgroundColor: string;
    refresh: () => void;
}> = observer((props) => {
    return (
        <BulkEditPanel
            panelLabel="Change Original Publisher"
            newValueLabel="New Original Publisher"
            actionButtonLabel="Change Orig. Publ."
            performChangesToAllMatchingBooks={ChangeOriginalPublisher}
            {...props}
        />
    );
});

async function ChangeOriginalPublisher(
    filter: IFilter,
    originalPublisher: string,
    refresh: () => void
) {
    ChangeColumnValueForAllBooksInFilter(
        filter,
        originalPublisher,
        "originalPublisher",
        refresh
    );
}
