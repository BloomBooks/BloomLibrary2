import React from "react";
import { IFilter } from "../../IFilter";
import { observer } from "mobx-react-lite";
import { FilterHolder } from "./BulkEditPage";
import { BulkEditPanel } from "./BulkEditPanel";
import { ChangeColumnValueForAllBooksInFilter } from "./BulkChangeFunctions";

export const HideBooksPanel: React.FunctionComponent<{
    filterHolder: FilterHolder;
    refresh: () => void;
    backgroundColor: string;
}> = observer((props) => {
    return (
        <BulkEditPanel
            panelLabel="Hide Books"
            newValueLabel="unused"
            actionButtonLabel="Hide All"
            performChangesToAllMatchingBooks={HideAllBooks}
            noValueNeeded={true}
            {...props}
        />
    );
});

async function HideAllBooks(filter: IFilter, tag: string, refresh: () => void) {
    HideAllBooksInFilter(filter, refresh);
}

export async function HideAllBooksInFilter(
    filter: IFilter,
    refresh: () => void
) {
    ChangeColumnValueForAllBooksInFilter(
        filter,
        "inCirculation",
        false,
        refresh
    );
}
