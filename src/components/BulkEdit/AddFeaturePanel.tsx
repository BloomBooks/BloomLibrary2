import React from "react";
import { IFilter } from "../../IFilter";
import { observer } from "mobx-react-lite";
import { FilterHolder } from "./BulkEditPage";
import { BulkEditPanel } from "./BulkEditPanel";
import { AddFeatureToAllBooksInFilter } from "./BulkChangeFunctions";

export const AddFeaturePanel: React.FunctionComponent<{
    filterHolder: FilterHolder;
    refresh: () => void;
    backgroundColor: string;
}> = observer((props) => {
    return (
        <BulkEditPanel
            panelLabel="Add Feature"
            newValueLabel="New Feature (start with '-' to remove feature)"
            actionButtonLabel="Add Feature"
            performChangesToAllMatchingBooks={AddFeature}
            {...props}
        />
    );
});

async function AddFeature(
    filter: IFilter,
    feature: string,
    refresh: () => void
) {
    AddFeatureToAllBooksInFilter(filter, feature, refresh);
}
