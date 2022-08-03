import React from "react";
import { IFilter } from "../../IFilter";
import { observer } from "mobx-react-lite";
import { FilterHolder } from "./BulkEditPage";
import { BulkEditPanel } from "./BulkEditPanel";
import { ChangeColumnValueForAllBooksInFilter } from "./BulkChangeFunctions";

export const AssignNotesPanel: React.FunctionComponent<{
    filterHolder: FilterHolder;
    backgroundColor: string;
    refresh: () => void;
}> = observer((props) => {
    return (
        <BulkEditPanel
            panelLabel="Set Note"
            newValueLabel="New Note"
            actionButtonLabel="Set Note"
            performChangesToAllMatchingBooks={ChangeNotes}
            {...props}
        />
    );
});

async function ChangeNotes(filter: IFilter, note: string, refresh: () => void) {
    ChangeColumnValueForAllBooksInFilter(
        filter,
        "librarianNote",
        note,
        refresh
    );
}
