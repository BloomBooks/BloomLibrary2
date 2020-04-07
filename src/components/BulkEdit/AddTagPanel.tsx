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
}> = observer((props) => {
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
